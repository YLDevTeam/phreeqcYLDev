/**
 * Une ligne du « selected output » de PHREEQC.
 * Les clés sont les en-têtes de colonnes ; les valeurs sont des nombres
 * lorsque la conversion est possible, sinon des chaînes.
 */
export type SelectedOutputRow = Record<string, number | string>;

/** Options de construction de {@link PhreeqC}. */
export interface PhreeqCOptions {
  /**
   * URL du module Emscripten (`iphreeqc.js`).
   * Par défaut : `../dist/iphreeqc.js` relatif au paquet.
   */
  jsUrl?: string;
  /**
   * URL du binaire WebAssembly (`iphreeqc.wasm`).
   * Par défaut : `../dist/iphreeqc.wasm` relatif au paquet.
   */
  wasmUrl?: string;
}

/** Sous-ensemble du module Emscripten utilisé par la classe. */
export interface PhreeqCModule {
  _CreateIPhreeqc(): number;
  _DestroyIPhreeqc(id: number): number;
  _LoadDatabaseString(id: number, input: number): number;
  _RunString(id: number, input: number): number;
  _GetErrorString(id: number): number;
  _GetSelectedOutputString(id: number): number;
  _SetSelectedOutputStringOn(id: number, value: number): number;
  _malloc(size: number): number;
  _free(ptr: number): void;
  UTF8ToString(ptr: number): string;
  stringToUTF8(str: string, ptr: number, maxBytes: number): void;
  lengthBytesUTF8(str: string): number;
  [key: string]: unknown;
}

/** Enveloppe d'IPhreeqc compilé en WebAssembly. */
export class PhreeqC {
  /**
   * Construit l'instance. Le module WASM se charge de façon asynchrone :
   * attendez {@link PhreeqC.ready} avant usage, ou préférez {@link PhreeqC.create}.
   *
   * @param database Contenu texte d'une base de données PHREEQC (ex. `PHREEQC.dat`).
   */
  constructor(database?: string, options?: PhreeqCOptions);

  /** Module Emscripten ; `null` tant que l'initialisation n'est pas terminée. */
  M: PhreeqCModule | null;

  /** Identifiant de l'instance IPhreeqc ; `null` avant initialisation ou après `destroy()`. */
  id: number | null;

  /** Promesse résolue quand l'instance est prête. */
  readonly ready: Promise<PhreeqC>;

  /** Crée une instance et attend qu'elle soit prête. */
  static create(database?: string, options?: PhreeqCOptions): Promise<PhreeqC>;

  /** Dernier message d'erreur d'IPhreeqc. */
  readonly error: string;

  /**
   * Charge une base de données depuis une chaîne.
   * @throws {Error} si le chargement échoue.
   */
  loadDatabase(text: string): this;

  /**
   * Exécute une entrée PHREEQC et renvoie le selected output.
   * @throws {Error} si l'exécution échoue.
   */
  run(input: string): SelectedOutputRow[];

  /** Selected output brut (texte tabulé). */
  selectedOutputString(): string;

  /** Selected output analysé en tableau d'objets. */
  selectedOutput(): SelectedOutputRow[];

  /** Libère l'instance IPhreeqc. */
  destroy(): void;
}

/**
 * Charge la base `PHREEQC.dat` fournie avec le paquet
 * (ou celle située à l'URL indiquée), sous Node comme dans le navigateur.
 */
export function loadDefaultDatabase(url?: string): Promise<string>;

export default PhreeqC;