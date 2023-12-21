// Adjust this file to next migration version remember to update the version in the file name

// can't migrate partial data, so if some data is missing migration will be aborted
const checkEmpty = (obj) => Object.entries(obj).forEach(([key,item]) => {
    if(item === undefined)
        throw new Error(`Missing ${key} in ${JSON.stringify(obj)}`);
});

// if metadata key has property version, then it's inputJson file, otherwise it's simulation job file
const checkType = (obj) => obj.metadata && obj.metadata.version ? 'inputJson' : 'simulationJob';

// replace whitespace with underscore and remove all non alphanumeric and non underscore characters
const sanitizationFunc = (str) => str.replace(/\s/g, '_').replace(/\W/g, '');

// migrate inputJson file
const migrateInputJson = (inputJson) => {
    const { 
        zoneManager: oldZoneManager, 
        materialManager: oldMaterialManager, 
        scoringManager: oldScoringManager, 
        ...restInputJson
    }
    = inputJson;

    checkEmpty({ 
        zoneManager: oldZoneManager, 
        materialManager: oldMaterialManager, 
        scoringManager: oldScoringManager, 
    });

    const materialManager = {
        ...oldMaterialManager,
        materials: oldMaterialManager.materials.map(material => ({
            ...material,
            sanitizedName: sanitizationFunc(material.name)
        })),
		metadata: {
			version: `0.12`,
			type: "Manager",
			generator: "MaterialManager.toJSON"
		},
    }

    const zoneManager = {
        ...oldZoneManager,
        zones: oldZoneManager.zones.map(zone => ({
            ...zone,
            ...("customMaterial" in zone ? {customMaterial: {
                ...zone.customMaterial,
                sanitizedName: sanitizationFunc(zone.customMaterial.name)
            }} : {})
        })),
        worldZone: {
            ...oldZoneManager.worldZone,
            ...("customMaterial" in oldZoneManager.worldZone ? {customMaterial: {
                ...oldZoneManager.worldZone.customMaterial,
                sanitizedName: sanitizationFunc(oldZoneManager.worldZone.customMaterial.name)
            }} : {})
        },
		metadata: {
			version: `0.12`,
			type: "Manager",
			generator: "ZoneManager.toJSON"
		},
    }

    const scoringManager = {
        ...oldScoringManager,
        outputs: oldScoringManager.outputs.map(output => ({
            ...output,
            quantities: output.quantities.map(quantity => ({
                ...quantity,
                ...("customMaterial" in quantity ? {customMaterial: {
                    ...quantity.customMaterial,
                    sanitizedName: sanitizationFunc(quantity.customMaterial.name)
                }} : {})
            }))
        })),
        metadata: {
          version: "0.11",
          type: "Manager",
          generator: "ScoringManager.toJSON"
        }
    }

    return {
        ...restInputJson,
        zoneManager,
        materialManager,
        scoringManager,
        metadata: {
            version: `0.12`,
            type: "Editor",
            generator: "YaptideEditor.toJSON"
        }
    }
}

// migrate simulation job file
const migrateSimulationJob = (fileJson) => {
    const { input, 
        ...restJson } = fileJson;

    checkEmpty({input});
    const { inputJson,...restInput } = input;

    return {
        input: {
            inputJson: migrateInputJson(inputJson),
            ...restInput
        },
        ...restJson
    }
}


const path = require('path');
const fs = require('fs');

const fileNameToMigrate = process.argv[2];

const pathToMigrate = path.resolve(process.cwd(), fileNameToMigrate);
const fileJson = require(pathToMigrate);

// create temp dir if not exists
if (!fs.existsSync('./migrations/temp'))
    fs.mkdirSync('./migrations/temp');

fs.writeFileSync(`./migrations/temp/${Date.now()}_${fileNameToMigrate}`, JSON.stringify(fileJson, null, 2));

const type = checkType(fileJson);
let newJson;

switch (type) {
    case 'inputJson':
        newJson = migrateInputJson(fileJson);

        break;
    case 'simulationJob':
        newJson = migrateSimulationJob(fileJson);

        break;
    default:
        throw new Error(`Unknown type ${type}`);
}

fs.writeFileSync(pathToMigrate, JSON.stringify(newJson, null, 2));


