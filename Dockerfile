# This is a multi-stage build to reduce the size of the final image.

# The first stage is used to build the application. It installs all the dependencies and builds the app.
# This creates a temporary image of > 1 GB.

# The second stage is used to serve the app using nginx. It copies the build folder from the first stage
# and weighs only ~ 80 MB.

# Stage 1: Generate SSL certificate
FROM alpine AS cert-gen

RUN apk add --no-cache openssl

WORKDIR /certs

RUN openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
    -keyout server.key -out server.crt

# Stage 2: Build the wheel package for the converter part of the UI.
FROM python:3.11 AS wheel-builder

COPY src/libs/converter/ .

# Install Poetry and build the wheel package.
RUN pip install --no-cache-dir "poetry ~= 1.8.2" \
    && poetry build --format wheel --no-ansi

# Stage 3: Build the application.
FROM node:20 AS build

# Directory where the app is installed and run.
WORKDIR /usr/src/app

# Copy SSL certificate from the cert-gen stage

# First, copy package.json and package-lock.json to install dependencies.
COPY package.json package-lock.json ./

# Install app dependencies using npm ci as it is preferred for automated builds.
RUN npm ci

# Bundle app source.
COPY . .

# Set HOME to /usr/src/app.
# This is needed to make sure that the git config is stored in the correct directory.
# Otherwise, the git config is stored in the root directory, which is not allowed.
# Also, pip installs some packages using the --user option, which requires HOME to be set.
ENV HOME /usr/src/app
RUN git config --global --add safe.directory /usr/src/app

# Run the setup script to identify the git commit hash and write it to a file.
# This file is later used to display the commit hash in the UI.
RUN npm run identify

# Copy the wheel package for the converter library from the previous build stage.
# This library is used in the UI.
COPY --from=wheel-builder dist/*.whl public/libs/converter/dist/

# Default deployment type can be overwritten by docker build --build-arg DEPLOYMENT=dev ...
ARG DEPLOYMENT=prod

RUN echo "Deploying for ${DEPLOYMENT}"

# Build the app.
RUN npx cross-env VITE_REACT_APP_DEPLOYMENT=${DEPLOYMENT} npm run build

# Stage 4: Serve the app using Nginx.
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy SSL certificate from the build stage
COPY --from=cert-gen /certs /etc/nginx/conf.d

# Copy the build folder from the build stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]

