# Tietokantatunnusten poisto Melindasta
[![Build Status](https://travis-ci.org/NatLibFi/melinda-local-ref-removal-ui.svg?branch=master)](https://travis-ci.org/NatLibFi/melinda-local-ref-removal-ui)

## Building the application

Install all dependencies:
`npm install`

Run build task:
`npm run build`

This will build the application into `build` directory.


## Start the application in production

```
npm install --prod
cd build
node index.js

(Application can be configured using environment variables, like HTTP_PORT=4000 node index.js for alternate port)
```

## Start the application in development

`npm run dev`

This will start webpack-dev-server for frontend codebase and nodemon for the backend.


