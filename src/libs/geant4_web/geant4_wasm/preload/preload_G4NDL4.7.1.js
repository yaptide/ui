export default async function loadDataFile(Module) {

  Module['expectedDataFileDownloads'] ??= 0;
  Module['expectedDataFileDownloads']++;
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
return new Promise((loadDataResolve, loadDataReject) => {
    async function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/workspaces/geant-wasm/build_wasm/data/G4NDL4.7.1.data';
      var REMOTE_PACKAGE_BASE = 'G4NDL4.7.1.data';
      var REMOTE_PACKAGE_NAME = Module['locateFile']?.(REMOTE_PACKAGE_BASE, '') ?? REMOTE_PACKAGE_BASE;
      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      async function fetchRemotePackage(packageName, packageSize) {
        
        Module['dataFileDownloads'] ??= {};
        try {
          var response = await fetch(packageName);
        } catch (e) {
          throw new Error(`Network Error: ${packageName}`, {e});
        }
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.url}`);
        }

        const chunks = [];
        const headers = response.headers;
        const total = Number(headers.get('Content-Length') ?? packageSize);
        let loaded = 0;

        Module['setStatus']?.('Downloading data...');
        const reader = response.body.getReader();

        while (1) {
          var {done, value} = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          Module['dataFileDownloads'][packageName] = {loaded, total};

          let totalLoaded = 0;
          let totalSize = 0;

          for (const download of Object.values(Module['dataFileDownloads'])) {
            totalLoaded += download.loaded;
            totalSize += download.total;
          }

          Module['setStatus']?.(`Downloading data... (${totalLoaded}/${totalSize})`);
        }

        const packageData = new Uint8Array(chunks.map((c) => c.length).reduce((a, b) => a + b, 0));
        let offset = 0;
        for (const chunk of chunks) {
          packageData.set(chunk, offset);
          offset += chunk.length;
        }
        return packageData.buffer;
      }

    async function runWithFS(Module) {

      function assert(check, msg) {
        if (!check) throw new Error(msg);
      }
Module['FS_createPath']("/", "data", true, true);
Module['FS_createPath']("/data", "G4NDL4.7.1", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1", "Capture", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Capture", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Capture", "FS", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Capture", "FSMF6", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1", "Elastic", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Elastic", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Elastic", "FS", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1", "Fission", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Fission", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Fission", "FC", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Fission", "FF", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Fission", "FS", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Fission", "LC", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Fission", "SC", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Fission", "TC", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1", "Inelastic", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F01", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F02", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F03", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F04", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F05", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F06", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F07", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F08", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F09", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F10", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F11", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F12", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F13", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F14", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F15", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F17", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F18", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F19", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F20", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F21", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F22", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F23", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F24", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F25", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F26", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F27", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F28", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F29", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F30", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F31", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F32", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F33", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F34", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F35", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "F36", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/Inelastic", "Gammas", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1", "IsotopeProduction", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/IsotopeProduction", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1", "JENDL_HE", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/JENDL_HE", "neutron", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/JENDL_HE/neutron", "Elastic", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/JENDL_HE/neutron/Elastic", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/JENDL_HE/neutron", "Inelastic", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/JENDL_HE/neutron/Inelastic", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1", "ThermalScattering", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering", "Coherent", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering/Coherent", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering/Coherent", "FS", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering", "Incoherent", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering/Incoherent", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering/Incoherent", "FS", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering", "Inelastic", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering/Inelastic", "CrossSection", true, true);
Module['FS_createPath']("/data/G4NDL4.7.1/ThermalScattering/Inelastic", "FS", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency'](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: async function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slice into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency'](`fp ${that.name}`);
loadDataResolve();
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

        var PACKAGE_UUID = metadata['package_uuid'];
        var IDB_RO = "readonly";
        var IDB_RW = "readwrite";
        var DB_NAME = "EM_PRELOAD_CACHE";
        var DB_VERSION = 1;
        var METADATA_STORE_NAME = 'METADATA';
        var PACKAGE_STORE_NAME = 'PACKAGES';

        async function openDatabase() {
          if (typeof indexedDB == 'undefined') {
            throw new Error('using IndexedDB to cache data can only be done on a web page or in a web worker');
          }
          return new Promise((resolve, reject) => {
            var openRequest = indexedDB.open(DB_NAME, DB_VERSION);
            openRequest.onupgradeneeded = (event) => {
              var db = /** @type {IDBDatabase} */ (event.target.result);

              if (db.objectStoreNames.contains(PACKAGE_STORE_NAME)) {
                db.deleteObjectStore(PACKAGE_STORE_NAME);
              }
              var packages = db.createObjectStore(PACKAGE_STORE_NAME);

              if (db.objectStoreNames.contains(METADATA_STORE_NAME)) {
                db.deleteObjectStore(METADATA_STORE_NAME);
              }
              var metadata = db.createObjectStore(METADATA_STORE_NAME);
            };
            openRequest.onsuccess = (event) => {
              var db = /** @type {IDBDatabase} */ (event.target.result);
              resolve(db);
            };
            openRequest.onerror = reject;
          });
        }

        // This is needed as chromium has a limit on per-entry files in IndexedDB
        // https://cs.chromium.org/chromium/src/content/renderer/indexed_db/webidbdatabase_impl.cc?type=cs&sq=package:chromium&g=0&l=177
        // https://cs.chromium.org/chromium/src/out/Debug/gen/third_party/blink/public/mojom/indexeddb/indexeddb.mojom.h?type=cs&sq=package:chromium&g=0&l=60
        // We set the chunk size to 64MB to stay well-below the limit
        var CHUNK_SIZE = 64 * 1024 * 1024;

        async function cacheRemotePackage(db, packageName, packageData, packageMeta) {
          var transactionPackages = db.transaction([PACKAGE_STORE_NAME], IDB_RW);
          var packages = transactionPackages.objectStore(PACKAGE_STORE_NAME);
          var chunkSliceStart = 0;
          var nextChunkSliceStart = 0;
          var chunkCount = Math.ceil(packageData.byteLength / CHUNK_SIZE);
          var finishedChunks = 0;

          return new Promise((resolve, reject) => {
            for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
              nextChunkSliceStart += CHUNK_SIZE;
              var putPackageRequest = packages.put(
                packageData.slice(chunkSliceStart, nextChunkSliceStart),
                `package/${packageName}/${chunkId}`
              );
              chunkSliceStart = nextChunkSliceStart;
              putPackageRequest.onsuccess = (event) => {
                finishedChunks++;
                if (finishedChunks == chunkCount) {
                  var transaction_metadata = db.transaction(
                    [METADATA_STORE_NAME],
                    IDB_RW
                  );
                  var metadata = transaction_metadata.objectStore(METADATA_STORE_NAME);
                  var putMetadataRequest = metadata.put(
                    {
                      'uuid': packageMeta.uuid,
                      'chunkCount': chunkCount
                    },
                    `metadata/${packageName}`
                  );
                  putMetadataRequest.onsuccess = (event) => resolve(packageData);
                  putMetadataRequest.onerror = reject;
                }
              };
              putPackageRequest.onerror = reject;
            }
          });
        }

        /*
         * Check if there's a cached package, and if so whether it's the latest available.
         * Resolves to the cached metadata, or `null` if it is missing or out-of-date.
         */
        async function checkCachedPackage(db, packageName) {
          var transaction = db.transaction([METADATA_STORE_NAME], IDB_RO);
          var metadata = transaction.objectStore(METADATA_STORE_NAME);
          var getRequest = metadata.get(`metadata/${packageName}`);
          return new Promise((resolve, reject) => {
            getRequest.onsuccess = (event) => {
              var result = event.target.result;
              if (result && PACKAGE_UUID === result['uuid']) {
                resolve(result);
              } else {
                resolve(null);
              }
            }
            getRequest.onerror = reject;
          });
        }

        async function fetchCachedPackage(db, packageName, metadata) {
          var transaction = db.transaction([PACKAGE_STORE_NAME], IDB_RO);
          var packages = transaction.objectStore(PACKAGE_STORE_NAME);

          var chunksDone = 0;
          var totalSize = 0;
          var chunkCount = metadata['chunkCount'];
          var chunks = new Array(chunkCount);

          return new Promise((resolve, reject) => {
            for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
              var getRequest = packages.get(`package/${packageName}/${chunkId}`);
              getRequest.onsuccess = (event) => {
                if (!event.target.result) {
                  reject(`CachedPackageNotFound for: ${packageName}`);
                  return;
                }
                // If there's only 1 chunk, there's nothing to concatenate it with so we can just return it now
                if (chunkCount == 1) {
                  resolve(event.target.result);
                } else {
                  chunksDone++;
                  totalSize += event.target.result.byteLength;
                  chunks.push(event.target.result);
                  if (chunksDone == chunkCount) {
                    if (chunksDone == 1) {
                      resolve(event.target.result);
                    } else {
                      var tempTyped = new Uint8Array(totalSize);
                      var byteOffset = 0;
                      for (var chunkId in chunks) {
                        var buffer = chunks[chunkId];
                        tempTyped.set(new Uint8Array(buffer), byteOffset);
                        byteOffset += buffer.byteLength;
                        buffer = undefined;
                      }
                      chunks = undefined;
                      resolve(tempTyped.buffer);
                      tempTyped = undefined;
                    }
                  }
                }
              };
              getRequest.onerror = reject;
            }
          });
        }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_/workspaces/geant-wasm/build_wasm/data/G4NDL4.7.1.data');

      }
      Module['addRunDependency']('datafile_/workspaces/geant-wasm/build_wasm/data/G4NDL4.7.1.data');

      Module['preloadResults'] ??= {};

        async function preloadFallback(error) {
          console.error(error);
          console.error('falling back to default preload behavior');
          processPackageData(await fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE));
        }

        try {
          var db = await openDatabase();
          var pkgMetadata = await checkCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME);
          var useCached = !!pkgMetadata;
          Module['preloadResults'][PACKAGE_NAME] = {fromCache: useCached};
          if (useCached) {
            processPackageData(await fetchCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME, pkgMetadata));
          } else {
            var packageData = await fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE);
            try {
              processPackageData(await cacheRemotePackage(db, PACKAGE_PATH + PACKAGE_NAME, packageData, {uuid:PACKAGE_UUID}))
            } catch (error) {
              console.error(error);
              processPackageData(packageData);
            }
          }
        } catch(e) {
          await preloadFallback(e)
        .catch((error) => {
          loadDataReject(error);
        });
        }

        Module['setStatus']?.('Downloading...');

    }
    if (Module['calledRun']) {
      runWithFS(Module)
        .catch((error) => {
          loadDataReject(error);
        });
    } else {
      (Module['preRun'] ??= []).push(runWithFS); // FS is not initialized yet, wait for it
    }

    Module['removeRunDependency']('preload_G4NDL4.7.1.js.metadata');
  }

  async function runMetaWithFS() {
    Module['addRunDependency']('preload_G4NDL4.7.1.js.metadata');
    var metadataUrl = Module['locateFile']?.('preload_G4NDL4.7.1.js.metadata', '') ?? 'preload_G4NDL4.7.1.js.metadata';
    
    var response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.url}`);
    }
    var json = await response.json();
    return loadPackage(json);
  }

  if (Module['calledRun']) {
    runMetaWithFS();
  } else {
    (Module['preRun'] ??= []).push(runMetaWithFS);
  }

  });
}
// END the loadDataFile function
