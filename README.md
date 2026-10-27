# phreeqcYLDev
PHREEQC (IPhreeqc) compilé en WebAssembly pour le navigateur et Node.js

## Structure du projet
phreeqcYLDev/   
├── package.json   
├── README.md   
├── LICENSE   
├── NOTICE   
├── src/   
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;├── index.js    
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;└── index.d.ts&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;← types   
└── dist/   
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;├── phreeqc.js&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;← glue Emscripten   
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;├── phreeqc.wasm   
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;└── database   
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;├── phreeqc.dat   
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;├── PHREEQC_ThermoddemV1.10_15Dec2020.dat   
│&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;└── ... (others databases)     

## Exemples d’utilisation

### Node
import PhreeqC, {loadDefaultDatabase} from "phreeqc-wasm"; <br>  

const phreeqc = await PhreeqC.create(await loadDefaultDatabase()); <br>  
phreeqc.run("    
&nbsp; &nbsp; SOLUTION 1     
&nbsp; &nbsp; &nbsp; &nbsp; temp 25   
&nbsp; &nbsp; &nbsp; &nbsp; pH 7   
&nbsp; &nbsp; &nbsp; &nbsp; Na 1 ; Cl 1   
&nbsp; &nbsp; SELECTED_OUTPUT   
&nbsp; &nbsp; &nbsp; &nbsp;-reset false    
&nbsp; &nbsp; &nbsp; &nbsp;-pH true   
&nbsp; &nbsp; &nbsp; &nbsp;-ionic_strength true    
&nbsp; &nbsp;END");    

### Navigateur / bundler (Vite)
Le même code fonctionne. Avec Vite, déclarez le .wasm comme asset si nécessaire :

import wasmUrl from "phreeqcYLDev/dist/iphreeqc.wasm?url";   
const phreeqc = await PhreeqC.create(db, {wasmUrl});   


### Observable :

import PhreeqC from "npm:phreeqcYLDev";   
const phreeqc = await PhreeqC.create(db, {
  jsUrl: "https://cdn.jsdelivr.net/npm/phreeqcYLDev/dist/iphreeqc.js",
  wasmUrl: "https://cdn.jsdelivr.net/npm/phreeqcYLDev/dist/iphreeqc.wasm"
});
