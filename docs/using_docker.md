## Using Docker

### Building the app using the Dockerfile

To build the docker image, type:

```bash
docker build -t ui .
```

Then you can run the docker container named `ui` and serve the UI on port 80:

```bash
docker run --rm -d -p 80:80/tcp --name ui ui
```

### Private docker image generated in the GHCR

The docker image is generated automatically after every commit to the main branch of this repository.
The package is here <https://github.com/yaptide/ui/pkgs/container/ui-web>

The command below will run the docker container named `ui` and serve the UI on port 80:

```bash
docker run --rm -d -p 80:80/tcp --name ui ghcr.io/yaptide/ui-web:master
```
