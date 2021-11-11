const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build')

fs.removeSync(buildPath);

const startupPath = path.resolve(__dirname, 'contracts', 'Startup.sol');

const source = fs.readFileSync(startupPath, 'utf8');

const out = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in out) {
	fs.outputJsonSync(
		path.resolve(buildPath, contract.replace(':', '') + '.json'), 
		out[contract]
		);
}