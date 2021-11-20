// code below borrowed from https://github.com/APTG/dedx_web/pull/92/files
const date = new Date().toLocaleDateString();
const commit = require('child_process').execSync('git rev-parse --short HEAD').toString().trim();

const branch = require('child_process').execSync('git describe --all').toString().trim();

console.log(
	JSON.stringify({
		date,
		commit,
		branch
	})
);
