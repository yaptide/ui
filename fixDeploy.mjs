// bug handler copied from https://github.com/facebook/create-react-app/issues/12503
// needed to fix https://github.com/yaptide/ui/issues/640

import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath, URL } from 'url';

(async () => {
	const repoRootUrl = new URL('./', import.meta.url);
	const repoRoot = repoRootUrl.pathname;
	const repoFolder = repoRoot.split('/').filter(Boolean).pop() ?? '/';
	const sourceFolder = path.join(repoRoot, 'build/static/js');

	if (!fse.existsSync(sourceFolder)) {
		throw new Error(
			`Failed to handle webpack path bug. Source folder (${sourceFolder}) does not exist.`
		);
	}

	const staticJsFiles = await fse.readdir(sourceFolder);

	// Fix paths in all .js files that do not start with "main." or "web-worker." as those two get correctly loaded directly from static/js.
	const filesToFix = staticJsFiles.filter(val => /^(?!main\.|web-worker\.).+\.js$/.test(val));

	for (const file of filesToFix) {
		console.log(`Fixing ${file}`);
		let code = await fse.readFile(path.join(sourceFolder, file), 'utf8');
		// remove duplicate 'static/js' from paths 
		code = code.split('static/js/').join('');
		// replace yaptide_converter references with absolute paths 
		code = code
			.split(/\.\/libs\/converter\/dist|\.\"\,\"\/libs\/converter\/dist/)
			.join(path.join('/', repoFolder, 'libs/converter/dist'));
		//overwrite the file
		await fse.writeFile(path.join(sourceFolder, file), code, 'utf8');
	}
})();
