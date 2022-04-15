let canImport = true;
let iterator = 1;
const examples = [];
while (canImport) {
	try {
		const example = require(`./ex${iterator}.json`);
		if (!(example.project?.title && example.project.title.length > 0))
			example.project.title = `Untitled example ${iterator}`;
		examples.push(example);
		iterator++;
	} catch (e) {
		canImport = false;
	}
}

export default examples;
