const date = new Date().toLocaleDateString()
const commit = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString().trim()

const branch = require('child_process')
    .execSync('git describe --all')
    .toString().trim()

console.log(JSON.stringify({
    date,
    commit,
    branch
}));
