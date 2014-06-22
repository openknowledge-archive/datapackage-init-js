In browser app showing how to create the DataPackage.json for Data Packages
using the datapackage-init library (suitably browserify-ed!).

## Building

For the app to work you need to build the browserify bundle:

    browserify lib.js > bundle.js

Or if using watchify during development you can do:

    watchify lib.js -o bundle.js --debug --verbose

