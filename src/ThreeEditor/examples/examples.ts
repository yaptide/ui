let canImport = true;
let iterator = 1;
const examples = [];
while (canImport) {
	try {
		const example = require(`./ex${iterator}.json`);
		if (!example.project?.name) example.project.name = `Example ${iterator}`;
		examples.push(example);
		iterator++;
	} catch (e) {
		canImport = false;
	}
}

export default examples;
