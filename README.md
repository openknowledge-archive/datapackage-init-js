datapackage-init
================

Create [Data Package][] datapackage.json files.

[Data Package]: http://data.okfn.org/standards/data-package

# Installation

[![NPM](https://nodei.co/npm/datapackage-init.png)](https://nodei.co/npm/datapackage-init/)

```
npm install datapackage-init
```

# Usage

Following assume you've imported the module as follows:

```
var dpinit = require('datapackage-init');
```

## init.init

Create a datapackage.json at the path specified.

```
dpinit.init(path, callback(err, datapackageJson));
```

* `path`: optional path to where your data package is (will use this to search
  for data to add, for an existing datapackage.json to update etc)

## init.simpleDefaults

Generate simple defaults for a `datapackage.json`

```
var defaults = dpinit.simpleDefaults();
```

## init.defaultsForLocalPackage

Get defaults based on a local file-system data package

```
dpinit.defaultsForLocalPackage(path_, cb)
```

* `path_`: path to the data package directory

Defaults here will include things like:

- Generating a name based on the directory
- Generating a description based on a README (if present)
- Searching for data files (csv and geojson at present) and adding them to the
  resources

