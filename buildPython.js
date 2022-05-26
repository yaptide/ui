const fs = require("fs");
const { execSync } = require("child_process");

const fileName = 'yaptide_converter-1.0.0-py3-none-any.whl';
const srcFolder = 'src/libs/converter/';
const srcFullPath = srcFolder + 'dist/' + fileName;
const destFolder = 'public/libs/converter/dist/';
const destFullPath = destFolder + fileName;

const SKIP = process.argv[2] === 'skip';

try {
    if (fs.existsSync(destFullPath) && SKIP === true) {
        //file exists
        console.log('yaptide_converter is already installed');
    } else {
        console.log('Building yaptide_converter');
        execSync("python3 -m build", {
            cwd: srcFolder
        }, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });

        console.log('Checking destination folder');
        if (!fs.existsSync(destFolder)) {
            console.log('Creating folder ' + destFolder);
            fs.mkdirSync(destFolder, { recursive: true });
        }

        console.log('Copying yaptide_converter');
        fs.copyFile(srcFullPath, destFullPath, (err) => {
            if (err) throw err;
            console.log('yaptide_converter was copied to destination');
            console.log(srcFullPath);
            console.log('=>');
            console.log(destFullPath);
        });
    }
} catch (err) {
    console.error(err);
}



