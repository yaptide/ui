// Adjust this file to next migration version remember to update the version in the file name

// can't migrate partial data, so if some data is missing migration will be aborted
const checkEmpty = (obj) => Object.entries(obj).forEach(([key,item]) => {
    if(item === undefined)
        throw new Error(`Missing ${key} in ${JSON.stringify(obj)}`);
});

// if metadata key has property version, then it's inputJson file, otherwise it's simulation job file
const checkType = (obj) => obj.metadata && obj.metadata.version ? 'inputJson' : 'simulationJob';

// migrate inputJson file
const migrateInputJson = (inputJson) => {
    const { 
        project: oldProject, 
        scene: oldScene, 
        zoneManager: oldZoneManager, 
        detectManager: oldDetectManager, 
        materialManager: oldMaterialManager, 
        scoringManager: oldScoringManager, 
        beam: oldBeam, 
        physic, 
        history, 
    }
    = inputJson;
    checkEmpty({ 
        project: oldProject, 
        scene: oldScene, 
        zoneManager: oldZoneManager, 
        detectManager: oldDetectManager, 
        materialManager: oldMaterialManager, 
        scoringManager: oldScoringManager, 
        beam: oldBeam, 
        physic,
        history
    });
    const metadata = {
        version: 1.0,
		type: "Editor",
		generator: "YaptideEditor.toJSON"
    };
    const project = {
        title: oldProject.title,
        description: oldProject.description,
        viewManager: oldProject.viewManager,
        history
    }
    const figureManager = {
        metadata: {
            version: 1.0,
            type: "Manager",
			generator: "FigureManager.toJSON"
        },
        uuid: "0F0F0F0F-0F0F-0F0F-0F0F-0F0F0F0F0F0F",
		name: "Figure Manager",
		type: "FigureManager",
        figures: oldScene.object.children.map(child => {
                const {
                    name,
                    type: meshType,
                    uuid,
                    geometryData: partialGeometryData,
                }
                = child;
                checkEmpty({name, uuid, type: meshType, geometryData: partialGeometryData});
                const type = meshType.replace('Mesh', 'Figure');
                return {
                    name,
                    type,
                    uuid,
                    visible: true,
                    geometryData: {
                        ...partialGeometryData,
                        geometryType: partialGeometryData.geometryType === 'CylinderGeometry' ? 'HollowCylinderGeometry' : partialGeometryData.geometryType,
                    },
                    colorHex: 0
                }
            })
    }
    const zoneManager = {
        uuid: oldZoneManager.uuid,
        name: oldZoneManager.name,
        type: oldZoneManager.type,
        zones: oldZoneManager.zones.map(zone => {
            return {
                ...zone,
                visible: true,
                type: 'BooleanZone'
            }
        }),
        worldZone: [oldZoneManager.worldZone].map(zone => {
            const {
                uuid, 
                type, 
                name, 
                materialUuid, 
                marginMultiplier, 
                geometryData: partialGeometryData, 
                autoCalculate,
            } = zone;
            return {
                uuid,
                type,
                name,
                materialUuid,
                marginMultiplier,
                geometryData: {
                    ...partialGeometryData,
                    geometryType: partialGeometryData.geometryType === 'CylinderGeometry' ? 'HollowCylinderGeometry' : partialGeometryData.geometryType,
                },
                autoCalculate,
                visible: true,
            }
        })[0],
		metadata: {
			version: 1.0,
			type: "Manager",
			generator: "ZoneManager.toJSON"
		},
    }
    const detectorManager = {
        uuid: oldDetectManager.uuid,
        name: oldDetectManager.name,
        type: 'DetectorManager',
        detectors: oldDetectManager.detectGeometries.map(
            detector => {
                const {
                    uuid,
                    name,
                    type:geometryType,
                    position,
                    rotation,
                    data:parameters,
                    colorHex
                } = detector;
                return {
                    uuid,
                    name,
                    type: 'Detector',
                    visible: true,
                    colorHex,
                    geometryData: {
                        parameters,
                        geometryType,
                        position,
                        rotation: rotation ?? [0,0,0],
                    }
                }
            }
        ),
		metadata: {
			version: 1.0,
			type: "Manager",
			generator: "DetectorManager.toJSON"
		},
    }
    const specialComponentsManager = {
		uuid: "0F0F0F0F-0F0F-0F0F-0F0F-0F0F0F0F0FFF",
		name: "Special Components",
        type: "SpecialComponentManager",
		metadata: {
			version: 1.0,
			type: "Manager",
			generator: "SpecialComponentManager.toJSON"
		}
    }
    const scoringManager = {
        name: oldScoringManager.name,
        uuid: oldScoringManager.uuid,
        type: 'ScoringManager',
		metadata: {
			version: 1.0,
			type: "Manager",
			generator: "ScoringManager.toJSON"
		},
        filters: oldDetectManager.filters.map(filter=>{
            return {
                uuid: filter.uuid,
                name: filter.name,
                type: 'Filter',
                rules: filter.rules
            }
        }),
        outputs: oldScoringManager.scoringOutputs.map(output=>{
            return {
                detectorUuid: output.detectGeometry,
                uuid: output.uuid,
                name: output.name,
                quantities: output.quantities.active,
                trace: output.trace,
                type: 'ScoringOutput',
            }
        })
    }
    const { beamSourceType: sourceType, sourceFile, ...beamParams } = oldBeam;
    const beam = {
        ...beamParams,
        sourceType,
        sourceFile,
        uuid: '0F0F0F0F-0F0F-0F0F-0F0F-0F0F0F0FFFFF',
        name: 'Beam',
        type: 'Beam',
    }
    const materialManager = {
        ...oldMaterialManager,
        uuid: '0F0F0F0F-0F0F-0F0F-0F0F-0F0F0FFFFFFF',
        name: 'Material Manager',
        type: 'MaterialManager',
		metadata: {
			version: 1.0,
			type: "Manager",
			generator: "MaterialManager.toJSON"
		},
    }
    return {
        metadata,
        project,
        figureManager,
        zoneManager,
        detectorManager,
        specialComponentsManager,
        scoringManager,
        beam,
        materialManager,
        physic,
        hash: 'f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0'
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


