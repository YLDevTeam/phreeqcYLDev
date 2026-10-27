const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null &&
  typeof window === "undefined";

const defaultJsUrl = new URL("../dist/phreeqc.js", import.meta.url).href;
const defaultWasmUrl = new URL("../dist/phreeqc.wasm", import.meta.url).href;

async function readWasmNode(wasmUrl) {
  const [{readFile}, {fileURLToPath}] = await Promise.all([
    import(/* @vite-ignore */ "node:fs/promises"),
    import(/* @vite-ignore */ "node:url")
  ]);
  const path = wasmUrl.startsWith("file:") ? fileURLToPath(wasmUrl) : wasmUrl;
  return readFile(path);
}

export class PhreeqC {
  constructor(database, {jsUrl = defaultJsUrl, wasmUrl = defaultWasmUrl} = {}) {
    this.M = null;
    this.id = null;
    this.ready = this._init(database, jsUrl, wasmUrl);
  }

  static async create(database, options) {
    const p = new PhreeqC(database, options);
    await p.ready;
    return p;
  }

  async _init(database, jsUrl, wasmUrl) {
    const {default: createPhreeqc} = await import(/* @vite-ignore */ jsUrl);

    const options = {
      locateFile: (path) => (path.endsWith(".wasm") ? wasmUrl : path),
      print: () => {},
      printErr: () => {}
    };

    // Sous Node, on fournit le binaire directement (fetch file:// non supporté)
    if (isNode && !/^https?:/.test(wasmUrl)) {
      options.wasmBinary = await readWasmNode(wasmUrl);
    }

    this.M = await createPhreeqc(options);
    this.id = this.M._CreateIPhreeqc();
    if (database) this.loadDatabase(database);
    this.M._SetSelectedOutputStringOn(this.id, 1);
    return this;
  }

  _withString(str, fn) {
    const M = this.M;
    const size = M.lengthBytesUTF8 ? M.lengthBytesUTF8(str) + 1 : str.length * 4 + 1;
    const ptr = M._malloc(size);
    M.stringToUTF8(str, ptr, size);
    try {
      return fn(ptr);
    } finally {
      M._free(ptr);
    }
  }

  get error() {
    return this.M.UTF8ToString(this.M._GetErrorString(this.id));
  }

  loadDatabase(text) {
    if (this._withString(text, (p) => this.M._LoadDatabaseString(this.id, p)) !== 0)
      throw new Error(this.error);
    return this;
  }

  run(input) {
    if (this._withString(input, (p) => this.M._RunString(this.id, p)) !== 0)
      throw new Error(this.error);
    return this.selectedOutput();
  }

  selectedOutputString() {
    return this.M.UTF8ToString(this.M._GetSelectedOutputString(this.id));
  }

  selectedOutput() {
    const lines = this.selectedOutputString().trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const head = lines[0].split("\t").map((s) => s.trim());
    return lines.slice(1).map((l) => {
      const v = l.split("\t");
      const row = {};
      head.forEach((h, i) => {
        if (!h) return;
        const x = v[i]?.trim();
        row[h] = x !== "" && !isNaN(+x) ? +x : x;
      });
      return row;
    });
  }

  destroy() {
    if (this.M && this.id != null) this.M._DestroyIPhreeqc?.(this.id);
    this.id = null;
  }
  
  
}

// À ajouter dans src/index.js
const defaultDbUrl = new URL("../dist/database/PHREEQC_ThermoddemV1.10_15Dec2020.dat", import.meta.url).href;

export async function loadDefaultDatabase(url = defaultDbUrl) {
  if (isNode && !/^https?:/.test(url)) {
    const {readFile} = await import(/* @vite-ignore */ "node:fs/promises");
    const {fileURLToPath} = await import(/* @vite-ignore */ "node:url");
    return readFile(fileURLToPath(url), "utf8");
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Impossible de charger ${url} (${res.status})`);
  return res.text();
}

export default PhreeqC;