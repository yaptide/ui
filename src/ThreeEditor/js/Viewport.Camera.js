import { UISelect } from './libs/ui.js';

function ViewportCamera(viewport, cameras) {
	//

	const cameraSelect = new UISelect();
	cameraSelect.setPosition('absolute');
	cameraSelect.setRight('10px');
	cameraSelect.setTop('10px');
	cameraSelect.onChange(() => {
		viewport.setCameraFromUuid(cameraSelect.getValue());
	});

	//

	const options = {};

	for (const key in cameras) {
		const camera = cameras[key];
		options[camera.uuid] = camera.name;
	}

	cameraSelect.setOptions(options);
	cameraSelect.setValue(viewport.camera.uuid);

	return cameraSelect;
}

export { ViewportCamera };
