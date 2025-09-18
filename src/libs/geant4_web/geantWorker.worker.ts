import createMainModule from './geant-web-stubs/geant4_wasm'

import  { default as initG4EMLOW }  from './geant-web-stubs/preload/preload_G4EMLOW8.6.1';
import  { default as initG4ENSDFSTATE }  from './geant-web-stubs/preload/preload_G4ENSDFSTATE3.0';
import  { default as initG4NDL }  from './geant-web-stubs/preload/preload_G4NDL4.7.1';
import  { default as initG4PARTICLEXS }  from './geant-web-stubs/preload/preload_G4PARTICLEXS4.1';
import  { default as initG4SAIDDATA }  from './geant-web-stubs/preload/preload_G4SAIDDATA2.0';
import  { default as initPhotoEvaporation }  from './geant-web-stubs/preload/preload_PhotonEvaporation6.1';

import {
    GeantWorkerMessage,
    GeantWorkerMessageType,
    GeantWorkerMessageFile
} from './GeantWorkerInterface';

import { TextDecoder } from 'util';

const s3_prefix_map: Record<string, string> = {
    ".wasm": "https://s3p.cloud.cyfronet.pl/geant4-wasm/",
    ".data": "https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/",
    ".metadata": "https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/",
    ".json": "https://s3p.cloud.cyfronet.pl/geant4-wasm/lazy_files_metadata/",
};

/* eslint-disable-next-line no-restricted-globals  */
var ctx: Worker = self as any; // TypeScript type assertion to treat self as a Worker

var preModule = {
    preRun: [    ],
    postRun: [],
    onRuntimeInitialized: function () {
        console.log("onRuntimeInitialized");
        postMessage({ type: 'init', data: "onRuntimeInitialized" });
    },
    printErr: (function () {
        return function (text: any) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');

            if (!text.includes('dependency')) {
                console.error(text);
            }
        };
    })(),
    print: (function () {

        return function (text: any) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');

            // console.log(text);
            postMessage({ type: 'print', data: text });

        };
    })(),
    last: {
        time: Date.now(),
        text: ''
    },
    setStatus: function (text: string) {
        if (!preModule.last) preModule.last = { time: Date.now(), text: '' };
        if (text === preModule.last.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - preModule.last.time < 30) return; // if this is a progress update, skip it if too soon
        preModule.last.time = now;
        preModule.last.text = text;
        postMessage({ type: 'status', data: text });
    },
    totalDependencies: 0,
    monitorRunDependencies: function (left: any) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        preModule.setStatus(left ? 'PROCESS (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    },
    locateFile: function (path: any, prefix: any) {
        // if it's a mem init file, use a custom dir
        const ext = path.slice(path.lastIndexOf('.'));
        if (ext in s3_prefix_map) {
            return s3_prefix_map[ext] + path;
        }

        // otherwise, use the default, the prefix (JS file's dir) + the path
        return prefix + path;
        },
};

var mod = createMainModule(preModule);

ctx.onmessage = async (event: MessageEvent<GeantWorkerMessage>) => {
     switch (event.data.type) {
        case GeantWorkerMessageType.INIT_DATA_FILES: {
            const res = await mod.then(async (module) => {
                
                console.log("Initializing lazy files...");
                try {
                    await initG4ENSDFSTATE(module);
                    await initG4EMLOW(module);
                    await initG4NDL(module);
                    await initG4PARTICLEXS(module);
                    await initG4SAIDDATA(module);
                    await initPhotoEvaporation(module);
                } catch (error: unknown) {
                    console.error("Error initializing lazy files:", (error as Error).message);
                }
                postMessage({ type: 'status', data: 'INIT END' });
            });
        break;
        }
        case GeantWorkerMessageType.INIT_LAZY_FILES: {
            const res = await mod.then(async (module) => {
                module.FS_createPath('/', 'data', true, true);
                module.FS_createPath('/data', 'G4EMLOW8.6.1', true, true);
                module.FS_createPath('/data', 'G4ENSDFSTATE3.0', true, true);
                module.FS_createPath('/data', 'G4NDL4.7.1', true, true);
                module.FS_createPath('/data', 'G4PARTICLEXS4.1', true, true);
                module.FS_createPath('/data', 'G4SAIDDATA2.0', true, true);
                module.FS_createPath('/data', 'PhotonEvaporation6.1', true, true);

                const jsonFiles = [
                    "load_G4EMLOW8.6.1.json",
                    "load_G4ENSDFSTATE3.0.json",
                    "load_G4NDL4.7.1.json",
                    "load_G4PARTICLEXS4.1.json",
                    "load_G4SAIDDATA2.0.json",
                    "load_PhotonEvaporation6.1.json"
                ];

                for (const jsonFile of jsonFiles) {
                    const path = s3_prefix_map[".json"] + jsonFile;
                    await fetch(path)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("HTTP error " + response.status);
                            }
                            return response.json();
                        })
                        .then((data: any) => {
                            for (const file of data) {
                                if (file.type === 'file') {
                                    module.FS_createLazyFile(file.parent, file.name, file.url, true, true);
                                } else if (file.type === 'path') {
                                    module.FS_createPath(file.parent, file.name, true, true);
                                }
                            }
                        });
                    console.log(`Loaded lazy files from ${jsonFile}`);
                }
            });
        break;
        }

        case GeantWorkerMessageType.CREATE_FILE:
            await mod.then((module) => {
                const data = event.data.data as GeantWorkerMessageFile;

                module.FS.createFile("/", data.name, null, true, true);
                module.FS.writeFile(data.name, data.data);
            });
            break;
        case GeantWorkerMessageType.READ_FILE:
            await mod.then((module) => {
                const fileName = event.data.data as string;

                const fileConent = module.FS.readFile(fileName, { encoding: "utf8" });

                ctx.postMessage({
                    type: GeantWorkerMessageType.FILE_RESPONSE,
                    data: {
                        name: fileName,
                        data: new TextDecoder().decode(fileConent)
                    } as GeantWorkerMessageFile
                } as GeantWorkerMessage)
            });
            break;
        case GeantWorkerMessageType.RUN_SIMULATION:
            try {
                console.log("Running GDML simulation...");
                const gdmlResult = await mod.then((module) => {
                    module.FS.createFile("/", "geom.gdml", null, true, true);
                    module.FS.createFile("/", "init.mac", null, true, true);

                    module.FS.writeFile('geom.gdml',
`<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gdml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://cern.ch/service-spi/app/releases/GDML/schema/gdml.xsd">

  <define/>

  <materials>
    <material name="BlackHole" state="solid">
      <T unit="K" value="293.15"/>
      <MEE unit="eV" value="823"/>
      <D unit="g/cm3" value="1e+8"/>
      <fraction n="1" ref="G4_Pb"/>
    </material>
  </materials>

  <solids>
    <tube aunit="deg" deltaphi="360" lunit="mm" name="solidWater" rmax="50" rmin="0" startphi="0" z="200"/>
    <tube aunit="deg" deltaphi="360" lunit="mm" name="solidVacuum" rmax="55" rmin="0" startphi="0" z="220"/>
    <tube aunit="deg" deltaphi="360" lunit="mm" name="solidWorld" rmax="60" rmin="0" startphi="0" z="240"/>
  </solids>

  <structure>
    <volume name="logicWater">
      <materialref ref="G4_WATER"/>
      <solidref ref="solidWater"/>
    </volume>
    <volume name="logicVacuum">
      <materialref ref="G4_Galactic"/>
      <solidref ref="solidVacuum"/>
      <physvol copynumber="1" name="physWater">
        <volumeref ref="logicWater"/>
        <position name="physWater_pos" unit="mm" x="0" y="0" z="-5"/>
      </physvol>
    </volume>
    <volume name="logicWorld">
      <materialref ref="BlackHole"/>
      <solidref ref="solidWorld"/>
      <physvol copynumber="1" name="physVacuum">
        <volumeref ref="logicVacuum"/>
      </physvol>
    </volume>
  </structure>

  <setup name="Default" version="1.0">
    <world ref="logicWorld"/>
  </setup>

</gdml>
`
                    );

                    module.FS.writeFile('init.mac',
`/run/initialize

##########################################
####### Particle Source definition #######
##########################################

/gps/verbose 0
/gps/particle proton
/gps/position 0 0 -10.5 cm

/gps/pos/type Beam
/gps/direction 0 0 1

/gps/ene/type Gauss
/gps/ene/mono 150 MeV
/gps/ene/sigma 1.5 MeV
/gps/ene/max 1000 MeV

##########################################
################ Scoring #################
##########################################

/score/create/cylinderMesh CylZ_Mesh
/score/mesh/cylinderSize 5 10 cm
/score/mesh/nBin 1 400 1
/score/quantity/energyDeposit eDep
/score/filter/particle protonFilter proton
/score/quantity/cellFlux fluence
/score/filter/particle protonFilter proton
/score/close

/score/create/boxMesh YZ_Mesh
/score/mesh/boxSize 0.5 4. 10. cm
/score/mesh/nBin 1 80 400
/score/quantity/energyDeposit eDep
/score/filter/particle protonFilter proton
/score/quantity/cellFlux fluence
/score/filter/particle protonFilter proton
/score/close

/score/create/probe Pr 2. cm
/score/probe/locate 0. 0. -5. cm
/score/quantity/cellFlux fluxdiff
/score/filter/particle protonFilter proton
/score/close

/analysis/h1/create fluxdiff Pr_differential 100 0. 200. MeV

/score/fill1D 0 Pr fluxdiff

##########################################
################## Run ###################
##########################################

/run/beamOn 10000

##########################################
############ Collect results #############
##########################################

/particle/dump
/score/dumpQuantityToFile CylZ_Mesh eDep cylz_edep.txt
/score/dumpQuantityToFile CylZ_Mesh fluence cylz_fluence.txt
/score/dumpQuantityToFile YZ_Mesh eDep yz_edep.txt
/score/dumpQuantityToFile YZ_Mesh fluence yz_fluence.txt
/score/dumpQuantityToFile Pr fluxdiff diff.txt
`
                    );
                    return module.Geant4GDMRun("geom.gdml", "init.mac");
                });

                console.log("GDML run result:", gdmlResult);

                const result_data = await mod.then((module) => {
                    return module.FS.readFile("cylz_fluence.txt", { encoding: "utf8" });
                });

                ctx.postMessage({
                    type: "gdmlResult",
                    result: gdmlResult
                });
            } catch (error: unknown) {
                ctx.postMessage({
                    type: "error",
                    message: (error as Error).message,
                    error: error
                });
            }
            break;
        default:
            console.warn("Unknown message type:", event.data);
    }
}