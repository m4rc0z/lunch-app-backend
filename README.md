# lunch-app-backend

### Local Setup

#####start backend:

```bash
$ npm run start:local
```

This will create a local mongodb with a database name `lunch-app-database` 
and a user `admin` with the password `admin`. 
It will also start the backend including the local mongodb instance.
The backend will be available on `http://localhost:3005`
It can happen that the backend throws an error at the first connect to the mongodb, 
in this case the backend tries to reconnect. 


#####start frontend:

1. to start the frontend you must checkout an other repository:

```bash
$ git checkout https://github.com/m4rc0z/lunch-admin-app.git
```

2. to start the frontend see instructions for local setup inside the readme of the frontend repository

## Docker

Build container:

``` bash
$ docker build -t m4rc0z/lunch-app-backend .
```

Run container:

```bash
$ docker run --env-file ./env.list -p 127.0.0.1:3005:3005/tcp -it m4rc0z/lunch-app-backend:latest
```

Connect with: http://localhost:3005

Stop the container:

```bash
$ docker stop --time 0 $(docker ps -q --filter ancestor=m4rc0z/lunch-app-backend)
```

Debug container:

```bash
$ docker run --entrypoint "/bin/sh" -it m4rc0z/lunch-app-backend:latest
```

### Base containers

Ideally one should use an alpine container, e.g. `FROM node:12.13.0-alpine`, but this gives a warning:

```bash
Sending build context to Docker daemon  419.3kB
Step 1/7 : FROM node:12.13.0-alpine as builder
...
mongodb-memory-server: checking MongoDB binaries cache...
Unknown linux distro Raspbian, falling back to legacy MongoDB build
mongodb-memory-server: binary path is /usr/src/app/node_modules/.cache/mongodb-memory-server/mongodb-binaries/4.0.3/mongod
...
```

This is a known issue, see:

- https://github.com/nodkz/mongodb-memory-server/issues/32 
- https://jira.mongodb.org/browse/SERVER-36790

for reference.

Alternatively use a mongo container, e.g.:

```bash
FROM mongo:4.2.1-bionic
...
``` 

But note the size difference:

```bash
$ docker images

node                          12.13.0-alpine      052e3dbb343f        3 days ago          80.9MB
mongo                         4.2.1-bionic        191b28dbfefe        33 hours ago        363MB
```