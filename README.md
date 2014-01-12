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

```
var init = require('datapackage-init');

init.init(path, callback(err, datapackageJson));
```

* `path`: optional path to where your data package is (will use this to search
  for data to add, for an existing datapackage.json to update etc)

