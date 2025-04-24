const fs = require('fs');
const { glob } = require('glob');
const path = require('path');
const { execSync } = require('child_process');
const { exit } = require('process');
const os = require('os');

const SKIP = process.argv[2] === 'skip';

const destFolder = 'public/libs/converter/dist/';
const srcFolder = 'src/libs/converter/';

const saveFileName = (destFolder, fileName) => {
	const data = JSON.stringify({ fileName: fileName });

	if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

	fs.writeFileSync(destFolder + 'yaptide_converter.json', data);
	console.log('yaptide_converter.json saved');
};

(async () => {
	const PYTHON = (() => {
		const pythonCmdArr = ['python3', 'python'];
		const index = pythonCmdArr.findIndex(pythonCmd => {
			console.log(`Checking for ${pythonCmd}`);

			try {
				execSync(`${pythonCmd} --version`);

				return true;
			} catch (e) {
				return false;
			}
		});

		if (index === -1) {
			console.error('Python not found');

			return exit(1);
		}

		return pythonCmdArr[index];
	})();

	console.log(`\nUsing: ${PYTHON}`);

	const installedPath = await glob(destFolder + 'yaptide_converter-*-py3-none-any.whl').then(
		files => files[0]
	);
	const installedFileName = path.basename(installedPath ?? '');

	// skip installation if file exists
	if (installedPath && SKIP === true) {
		//file exists
		console.log(`${installedFileName} is already installed`);
		saveFileName(destFolder, installedFileName);
	} else {
		const measureTime = (label, callback) => {
			console.log('Start: ' + label);
			console.time(label);

			try {
				callback();
			} catch (error) {
				console.error(error.stdout.toString());
				exit(1);
			}

			console.timeEnd(label);
		};

		const executeCommand = command => {
			console.log(`Executing: ${command}`);
			const output = execSync(command, {
				encoding: 'utf-8',
				cwd: srcFolder
			});
			console.log('Output:', output);
		};

		const venvCommandPrefix =
			os.platform() === 'win32'
				? 'powershell -NoProfile -Command "& { .\\venv\\Scripts\\Activate.ps1 ; '
				: '. venv/bin/activate &&';
		const venvCommandSuffix = os.platform() === 'win32' ? ' }"' : '';

		measureTime('Create venv environment', () => {
			executeCommand(`${PYTHON} -m venv venv`);
		});

		measureTime('Installing build module for python', () => {
			executeCommand(
				`${venvCommandPrefix} pip install "poetry == 1.8.5" ${venvCommandSuffix}`
			);
		});

		measureTime('Building yaptide_converter', () => {
			executeCommand(
				`${venvCommandPrefix} poetry build --format wheel --no-ansi ${venvCommandSuffix}`
			);
		});

		console.log('Checking destination folder');

		if (!fs.existsSync(destFolder)) {
			console.log('Creating folder ' + destFolder);
			fs.mkdirSync(destFolder, { recursive: true });
		}

		const buildFilePath = await glob(
			srcFolder + 'dist/yaptide_converter-*-py3-none-any.whl'
		).then(files => files[0]);
		const buildFileName = path.basename(buildFilePath ?? '');

		const destFullPath = destFolder + buildFileName;

		console.log('Copying yaptide_converter');
		fs.copyFile(buildFilePath, destFullPath, err => {
			if (err) {
				console.error(err.message);
				exit(1);
			}

			console.log('yaptide_converter was copied to destination');
			console.log(buildFilePath);
			console.log('=>');
			console.log(destFullPath);
		});
		saveFileName(destFolder, buildFileName);
	}
})();
