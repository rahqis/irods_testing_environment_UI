# iRODS UI Testing Environment

This repository is a user-friendly, localhost web-app that eases the iRODS Testing Environment

## Needed installations

The application is built using Node and React, therefore having both installed using npm would be ideal. Currently there is no automatic build for local host.

## To get started

After cloning the repository, in the terminal of the repo type the following

```
$ npm install
$ npm start
$ cd client
$ npm install
$ npm start
```

React will prompt you to want to host the web app in a different browser other than 3000, be sure to confirm yes. The server runs on localhost:3000 and is used as a proxy for the React app. Therefore, if you change the port of the server, you MUST change the proxy setting in client/package.json

## Features

Some features for the UI testing environment includes a testing page and a history page.

The Testing Page includes:

- Python test file
- Concurrent containers
- Project directory
- Selecting either package version or package directory
- Verbosity

The Test History Page includes:

- Timestamp of test run
- Basic test information (tests ran, general pass/failure of test, log directory, etc.)
- Ability to read XML test reports and location

##
