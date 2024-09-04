# yaptide web interface

## For users

The development version is unstable, without many features and with a lot of bugs.
It is released automatically after every commit to the main branch of this repository and is available for testing here:
<https://yaptide.github.io/web_dev/>

The stable version is not released yet, have patience.

### Loading a project file with results from a URL

You can load a project file with results from a URL by adding `?<project_file_url>` to the end of the editor URL.

```txt
https://<editor_url>?<project_file_url>
```

Example: <https://yaptide.github.io/web_dev/?https://raw.githubusercontent.com/yaptide/ui/master/src/ThreeEditor/examples/ex1.json>

To see the results, you need to navigate to the `Results` tab in the main menu.

## For developers

Start by downloading submodules:

```bash
git submodule update --init --recursive
```

Before starting the local version of the web interface, you need to install the necessary dependencies by typing the command:

```bash
npm install
```

To run the app in the development mode, type:

```bash
npm run start
```

Then open [http://localhost:3000/web_dev](http://localhost:3000/web_dev) to view it in the web browser.

The page will reload if you make edits.

### App configuration

Currently, app can be configured by setting the following environment variables in .env file in the main project directory (same as `package.json` is located).

#### Setting communication with backend
UI can be deployed on different machine (with different IP) than a backend. During build phase the UI can be configured to talk to given backend instance via `REACT_APP_BACKEND_URL` environmental variable. To adjust it put following line in the `.env` file:

If the backend is deployed as a set of docker containers, then Flask is listening on port **6000** for HTTP requests (HTTPS is supported only via NGINX proxy) on a host called `yaptide_flask`. 
Additionally, the main NGINX proxy server listens on port **5000** for plain HTTP and **8443** for HTTPS. Relevant configuration can be found in this [config file](https://github.com/yaptide/yaptide/blob/master/nginx.conf) of backend 

**Make sure that both url for backend in `.env` and url typed in browser's address bar contain same domain part: either localhost or 127.0.0.1. When e.g. in browser frontend will be opend from localhost:3000 and REACT_APP_BACKEND_URL will be set to http://127.0.0.1:5000 the difference in domains will cause browser to block setting access_token and refresh_token returned from backend as part of a response to login request. It's because cookie option samesite='Lax' set in backend. Failing in setting up cookies will result in each refresh request failing.**


#### Other configuration options are:
- `REACT_APP_TARGET` - if set to `demo`, app will not require authentication and will be preloaded with demo results (this version is available at <https://yaptide.github.io/web_dev/>)
- `REACT_APP_ALT_AUTH` - if set to `plg`, app will use plgrid authentication
- `REACT_APP_DEPLOYMENT` - if set to `dev`, configuration wil be editable from the browser console. For example, you can change the backend URL by typing `window.BACKEND_URL="http://mynew.url"` in the browser console.

### Useful commands

In order to easy configure the app, `cross-env` package for setting env is used with custom npm scripts.

| Command               | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `npm run start`       | Runs the app in the development mode.                                       |
| `npm run build`       | Builds the app for production to the `build` folder.                        |
| `npm run start-demo`  | Runs the app in the development mode with demo results.                     |
| `npm run build-demo`  | Builds the app for production to the `build` folder with demo results.      |
| `npm run start-plg`   | Runs the app in the development mode with plgrid authentication.            |
| `npm run build-plg`   | Builds the app for production to the `build` folder with plgrid authentication. |
| `npm run format`      | Runs the formatter.                                                         |
| `npm run test`        | Launches the test runner in the interactive watch mode.                     |

For more commands, see `package.json`.

### Building the app using the Dockerfile

To build the docker image, type:

```bash
docker build -t ui .
```

Then you can run the docker container named `ui` and serve the UI on port 80:

```bash
docker run --rm -d -p 80:80/tcp --name ui ui
```

## Requirements

- Node.js 20.x or higher 
- Python 3.9+
- pip and venv

## Private docker image generated in the GHCR

The docker image is generated automatically after every commit to the main branch of this repository.
The package is here <https://github.com/yaptide/ui/pkgs/container/ui-web>

The command below will run the docker container named `ui` and serve the UI on port 80:

```bash
docker run --rm -d -p 80:80/tcp --name ui ghcr.io/yaptide/ui-web:master
```

## Credits

This project adapts source code from the following libraries:

- CSG javascript library <https://github.com/manthrax/THREE-CSGMesh>
  - parts of its code copied into `src/ThreeEditor/js/libs/csg/`
  - adapted by adding types in a separate file
- ThreeJS Editor <https://threejs.org/editor/>
  - most of its code is copied from [mrdoob's GitHub repo](https://github.com/mrdoob/three.js/tree/r132/editor) into `src/ThreeEditor`, starting from v.132
  - the copied code is heavily adapted to "yaptide needs"

This work was partially funded by EuroHPC PL Project, Smart Growth Operational Programme 4.2
