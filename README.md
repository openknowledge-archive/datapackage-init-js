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

Start off by requiring the module as follows:

```
var dpinit = require('datapackage-init');
```

## init

Create a datapackage.json at the path specified.

```
dpinit.init(path, callback(err, datapackageJson));
```

* `path`: path to where your data package is (will use this to search
  for data to add, for an existing datapackage.json to update etc)

## create

Create a Data Package JSON and return it in the callback.

```
dpinit.create(path_, callback(err, datapackageJson));
```

* `path`: path to where your data package data is located. This is used to
  search for data to add, for an existing datapackage.json to update etc)


## simpleDefaults

Generate simple defaults for a `datapackage.json`

```
var defaults = dpinit.simpleDefaults();
```

## defaultsForLocalPackage

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

## createResourceEntry

```
dpinit.createResourceEntry(filepath, cb)
```

Create a resource entry in a Data Package for file at `filepath` returning the
data in the callback.

## createResourceEntries

```
dpinit.createResourceEntries(dir, cb)
```

Create a set of resource entries for a Data Package for all suitable files in
`dir` and its child directories.

