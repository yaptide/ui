// Adjust this file to next migration version remember to update the version in the file name

const path = require('path');
const fs = require('fs');

const fileNameToMigrate = process.argv[2];

const pathToMigrate = path.resolve(process.cwd(), fileNameToMigrate);
const fileJson = require(pathToMigrate);

// create temp dir if not exists
if (!fs.existsSync('./migrations/temp'))
    fs.mkdirSync('./migrations/temp');

fs.writeFileSync(`./migrations/temp/${Date.now()}_${fileNameToMigrate}`, JSON.stringify(fileJson, null, 2));


const { result, inputFiles, inputJson, ...restJson } = fileJson;

// check if all of them are not empty
if ([result, inputFiles, inputJson].some((item) => item === undefined)) throw console.error('Some of the fields are empty');

const newJson = {
    input: {
        inputFiles,
        inputJson
    },
    estimators: result.estimators,
    ...restJson
};

fs.writeFileSync(pathToMigrate, JSON.stringify(newJson, null, 2));


