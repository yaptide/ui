import { devLog } from '../../util/devLog';

function Storage() {
	const indexedDB =
		window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	if (indexedDB === undefined) {
		console.warn('Storage: IndexedDB not available.');

		return {
			init: function () {},
			get: function () {},
			set: function () {},
			clear: function () {}
		};
	}

	const name = 'threejs-editor';
	const version = 1;

	let database;

	const deleteDatabase = function () {
		const req = indexedDB.deleteDatabase(name);
		req.onsuccess = function () {
			console.log('Deleted database successfully');
		};

		req.onerror = function () {
			console.log('Could not delete database');
		};

		req.onblocked = function () {
			console.log('Could not delete database due to the operation being blocked');
		};
	};

	return {
		init: function (callback) {
			const request = indexedDB.open(name, version);
			request.onupgradeneeded = function (event) {
				const db = event.target.result;

				if (db.objectStoreNames.contains('states') === false) {
					db.createObjectStore('states');
				}
			};

			request.onsuccess = function (event) {
				database = event.target.result;

				callback();
			};

			request.onerror = function (event) {
				console.error('IndexedDB', event);
				// delete database
				deleteDatabase();
			};
		},

		get: function (callback) {
			try {
				const transaction = database.transaction(['states'], 'readwrite');
				const objectStore = transaction.objectStore('states');
				const request = objectStore.get(0);
				request.onsuccess = function (event) {
					callback(event.target.result);
				};
			} catch (error) {
				console.error(error);
				deleteDatabase();
			}
		},

		set: function (data) {
			try {
				const start = performance.now();

				const transaction = database.transaction(['states'], 'readwrite');
				const objectStore = transaction.objectStore('states');
				const request = objectStore.put(data, 0);
				request.onsuccess = function () {
					devLog(
						'Saved state to IndexedDB.',
						`${(performance.now() - start).toFixed(2)}ms`
					);
				};
			} catch (error) {
				console.error(error);
				deleteDatabase();
			}
		},

		clear: function () {
			if (database === undefined) return;

			const transaction = database.transaction(['states'], 'readwrite');
			const objectStore = transaction.objectStore('states');
			const request = objectStore.clear();
			request.onsuccess = function () {
				devLog('Cleared IndexedDB.');
			};
		}
	};
}

export { Storage };
