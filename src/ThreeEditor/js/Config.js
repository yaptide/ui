function Config() {
	let name = 'threejs-editor';

	let storage = {
		'language': 'en',

		'autosave': true,

		'layout': 'fourViews', //YAPTIDE LAYOUT

		'project/title': 'New Project',
		'project/description': '',
		'project/editable': false,

		'project/renderer/antialias': true,
		'project/renderer/shadows': true,
		'project/renderer/shadowType': 1, // PCF
		'project/renderer/physicallyCorrectLights': false,
		'project/renderer/toneMapping': 0, // NoToneMapping
		'project/renderer/toneMappingExposure': 1,

		'settings/history': false,

		'settings/shortcuts/translate': 'w',
		'settings/shortcuts/rotate': 'e',
		'settings/shortcuts/scale': 'r',
		'settings/shortcuts/undo': 'z',
		'settings/shortcuts/focus': 'f'
	};

	let listeners = {
		'language': [],
		'autosave': [],
		'layout': [],
		'project/title': [],
		'project/description': [],
		'project/editable': [],
		'project/renderer/antialias': [],
		'project/renderer/shadows': [],
		'project/renderer/shadowType': [],
		'project/renderer/physicallyCorrectLights': [],
		'project/renderer/toneMapping': [],
		'project/renderer/toneMappingExposure': [],
		'settings/history': [],
		'settings/shortcuts/translate': [],
		'settings/shortcuts/rotate': [],
		'settings/shortcuts/scale': [],
		'settings/shortcuts/undo': [],
		'settings/shortcuts/focus': []
	};

	if (window.localStorage[name] === undefined) {
		window.localStorage[name] = JSON.stringify(storage);
	} else {
		const data = JSON.parse(window.localStorage[name]);

		for (let key in data) {
			storage[key] = data[key];
		}
	}

	return {
		getKey: function (key) {
			return storage[key];
		},

		setKey: function () {
			// key, value, key, value ...

			for (let i = 0, l = arguments.length; i < l; i += 2) {
				let key = arguments[i];
				let value = arguments[i + 1];
				storage[key] = value;
				if (listeners[key] === undefined) listeners[key] = [];
				listeners[key].forEach(listener => {
					listener(value);
				});
			}

			window.localStorage[name] = JSON.stringify(storage);

			console.log(
				'[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', // eslint-disable-line
				'Saved config to LocalStorage.'
			);
		},

		clear: function () {
			delete window.localStorage[name];
		},

		addListener: function (key, callback) {
			listeners[key].push(callback);
		},

		removeListener: function (key, callback) {
			const index = listeners[key].indexOf(callback);

			if (index !== -1) {
				listeners[key].splice(index, 1);
			}
		}
	};
}

export { Config };
