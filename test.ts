import PhreeqC, {loadDefaultDatabase, type SelectedOutputRow} from "phreeqc-wasm";

const pq = await PhreeqC.create(await loadDefaultDatabase());
const rows: SelectedOutputRow[] = pq.run("SOLUTION 1\nEND");
const ph = rows[0]?.pH; // number | string | undefined