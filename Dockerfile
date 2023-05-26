# This is a multi-stage build to reduce the size of the final image
# First stage is used to build the application, it installs all the dependencies and builds the app
# at this temporary image of > 1 GB is created
# Second stage is used to serve the app using nginx, it copies the build folder from the first stage
# and weighs only ~ 80 MB
FROM node:18 AS build

# Install python3-pip via apt and clean cache
# pip is needed to generate wheel package for converter part of the UI
# which later is being called using pyodide (python in the browser)
RUN apt-get update && apt-get install -y --no-install-recommends python3-pip && rm -rf /var/lib/apt/lists/*

# Directory where the app is installed and run
WORKDIR /usr/src/app

# First copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install app dependencies using npm ci as it is preferred for automated builds
RUN npm ci

# Bundle app source
COPY . .

# set HOME to /usr/src/app
# this is needed to make sure that the git config is stored in the correct directory
# otherwise the git config is stored in the root directory which is not allowed
# also pip installs some packages using --user option which requires HOME to be set
ENV HOME /usr/src/app
RUN git config --global --add safe.directory /usr/src/app

# Run setup script to identify the git commit hash and write it to a file
# This file is later used to display the commit hash in the UI
# We also generate the wheel package for the converter part of the UI
RUN npm run setup

# Build the app
RUN npm run build

# Fix deploy
RUN npm run fix-web-dev

# Stage 2: Serve the app using Nginx
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Openshift uses a random user id to run the container at a later stage
# therefore we need to make sure that the user has the correct permissions
#RUN chgrp -R 0 /usr/src/app
#RUN chmod -R g=u /usr/src/app
