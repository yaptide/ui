import { UISelect } from './libs/ui.js';

function ViewportCamera(viewport, cameras) {

	//

	var cameraSelect = new UISelect();
	cameraSelect.setPosition('absolute');
	cameraSelect.setRight('10px');
	cameraSelect.setTop('10px');
	cameraSelect.onChange(function () {

		viewport.setCameraFromUuid(this.getValue());

	});

	//



	var options = {};



	for (var key in cameras) {

		var camera = cameras[key];
		options[camera.uuid] = camera.name;

	}

	cameraSelect.setOptions(options);
	cameraSelect.setValue(viewport.camera.uuid);


	return cameraSelect;

}

export { ViewportCamera };
