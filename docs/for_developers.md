## For developers

Start by downloading submodules:

```bash
git submodule update --init --recursive
```

Create local file .env to be able to communicate with backend and paste there:

```bash
REACT_APP_BACKEND_URL = https://localhost:8443
```

Before starting the local version of the web interface, you need to install the necessary dependencies by typing the command:

```bash
npm install
```

In case of problem "CMD.EXE was started with the above path as the current directory. UNC paths are not supported." I recommand to set up project from begining. Clone it somewhere where Windows has acces (in my case mnt/c/users/Mateusz/yaptide).

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

#### Other configuration options are:

-   `REACT_APP_TARGET` - if set to `demo`, app will not require authentication and will be preloaded with demo results (this version is available at <https://yaptide.github.io/web_dev/>)
-   `REACT_APP_ALT_AUTH` - if set to `plg`, app will use plgrid authentication
-   `REACT_APP_DEPLOYMENT` - if set to `dev`, configuration wil be editable from the browser console. For example, you can change the backend URL by typing `window.BACKEND_URL="http://mynew.url"` in the browser console.

### Useful commands

In order to easy configure the app, `cross-env` package for setting env is used with custom npm scripts.

| Command              | Description                                                                     |
| -------------------- | ------------------------------------------------------------------------------- |
| `npm run start`      | Runs the app in the development mode.                                           |
| `npm run build`      | Builds the app for production to the `build` folder.                            |
| `npm run start-demo` | Runs the app in the development mode with demo results.                         |
| `npm run build-demo` | Builds the app for production to the `build` folder with demo results.          |
| `npm run start-plg`  | Runs the app in the development mode with plgrid authentication.                |
| `npm run build-plg`  | Builds the app for production to the `build` folder with plgrid authentication. |
| `npm run format`     | Runs the formatter.                                                             |
| `npm run test`       | Launches the test runner in the interactive watch mode.                         |

For more commands, see `package.json`.

## Requirements

-   Node.js 18.x or higher
-   Python 3.9+
-   pip and venv
