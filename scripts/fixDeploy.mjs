// bug handler copied from https://github.com/facebook/create-react-app/issues/12503
// needed to fix https://github.com/yaptide/ui/issues/640

import fse from 'fs-extra';
import path from 'path';
import { URL } from 'url';

const PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH || '/';

(async () => {
	const repoRootUrl = new URL('../', import.meta.url);
	const repoRoot = repoRootUrl.pathname;
	const repoFolder = repoRoot.split('/').filter(Boolean).pop() ?? '/';
	const sourceFolder = path.join(repoRoot, 'build/static/js');
	console.dir({ repoRoot, repoFolder, sourceFolder, PUBLIC_PATH });

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
		// in some chunk files the 'static/js' is already present in the path, therefore adding it by string concatenation results in corrupted paths with 'static/js/static/js' entries
		// here we solve that issues by replacing all occurrences of 'static/js' by empty string, so only single 'static/js' item will be propagated into chunks path
		// the problem is reported here: https://github.com/facebook/create-react-app/issues/12503 , once solved in react-script, the hacking below will be obsolete
		code = code.split('static/js/').join('');
		// replace yaptide_converter references with absolute paths
		code = code
			.split(/\.\/libs\/converter\/dist|\.\"\,\"\/libs\/converter\/dist/)
			.join(path.join(PUBLIC_PATH, 'libs/converter/dist'));
		//overwrite the file
		await fse.writeFile(path.join(sourceFolder, file), code, 'utf8');
	}
})();
