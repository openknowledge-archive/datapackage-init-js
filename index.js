var fs = require('fs')
  , path = require('path')
  , jtsinfer = require('json-table-schema-infer')
  , assert = require('assert')
  ;

// init datapackage.json on disk
exports.init = function(path_, cb) {
  path_ = path_.replace(/datapackage.json$/, '');
  var dpjsonPath = path.join(path_, 'datapackage.json');
  exports.create(path_, function(err, dpjson) {
    if (err) {
      cb(err)
    } else {
      var fdata = JSON.stringify(dpjson, null, 2);
      fs.writeFileSync(dpjsonPath, fdata, {encoding: 'utf8'});
      cb(err, dpjson);
    }
  });
}

// create Data Package JSON
exports.create = function(path_, cb) {
  path_ = path_.replace(/datapackage.json$/, '');
  var dpjsonPath = path.join(path_, 'datapackage.json');
  existing = fs.existsSync(dpjsonPath) ?
      existing = JSON.parse(fs.readFileSync(dpjsonPath, 'utf8'))
      :
      { resources: [] }
    ;
  exports.defaultsForLocalPackage(path_, function(err, dpjson) {
    if (err) {
      cb(err)
    } else {
      // update existing but do not overwrite existing data in it
      for(k in dpjson) {
        if (k == 'resources') {
          var existingResPaths = existing['resources'].map(function(res) {
            return res['path']
          });
          dpjson['resources'].forEach(function(res) {
            if (existingResPaths.indexOf(res['path']) === -1) {
              existing['resources'].push(res);
            }
          });
        } else {
          // if key not present add o/w do nothing
          if (!(k in existing)) {
            existing[k] = dpjson[k];
          }
        }
      }
      cb(err, existing);
    }
  });
}

exports.simpleDefaults = function() {
  var out = {
    "name" : 'my-data-package',
    "title": '',
    "description": '',
    "homepage": '',
    "version" : '0.1.0',
    "license" : 'ODC-PDDL-1.0',
    "resources": []

  }
  return out;
}

// get defaults based on a file path (assumed to be directory)
exports.defaultsForLocalPackage = function(path_, cb) {
  var dpjson = exports.simpleDefaults();
  dpjson.name = path.basename(path_).replace(/^node-|[.-]js$/g, '');
  dpjson.description = _getDescriptionFromReadme(path_);
  dpjson.repository = _getGitRepo(path_);
  exports.createResourceEntries(path_, function(err, resources) {
    if (err) {
      console.error(err)
    }
    dpjson.resources = resources;
    cb(null, dpjson);
  });
}

// ========================================================
// Helpers

// locate potential data files in this directory
exports.findDataFiles = function(dir) {
  var dir = dir || '.';
  var dataDir = path.join(dir, 'data');
  var files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).map(function(fn) { return 'data/' + fn }) : fs.readdirSync(dir);
  files = files.filter(function(filename) {
    isDataFile = path.extname(filename) in {
          '.csv': ''
        , '.geojson': ''
      };
    return isDataFile;
  });
  return files;
}

// TODO: replace with proper mimetype lookup
var ext2mediatypeMap = {
    'csv': 'text/csv'
  , 'geojson': 'application/json'
};

// path should be relative ...
// assuming we have csvs for the present
exports.createResourceEntry = function(filepath, cb) {
  var ext = path.extname(filepath).toLowerCase().replace('.', '');
  var name = path.basename(filepath.toLowerCase(), '.' + ext);
  var out = {
    name: name,
    path: filepath,
    format: ext.toLowerCase()
  };
  if (ext in ext2mediatypeMap) {
    out.mediatype = ext2mediatypeMap[ext];
  }
  var stats = fs.statSync(filepath);
  assert(stats.isFile(), 'Resource %s is not a file'.replace('%s', filepath));
  out.bytes = stats.size;
  if (ext === 'csv') {
    // TODO: reinstate utf8 stuff once jtsinfer is fixed
    // jtsinfer(fs.createReadStream(filepath, {encoding: 'utf8'}), function(err, schema) {
    jtsinfer(fs.createReadStream(filepath), function(err, schema) {
      // add description attribute in
      schema.fields.forEach(function(field) {
        field.description = '';
      });
      out.schema = schema;
      cb(null, out);
    });
  } else {
    cb(null, out)
  }
}

exports.createResourceEntries = function(dir, cb) {
  var count = 0
    , dataFiles = exports.findDataFiles(dir).map(function(fp) { return path.join(dir, fp) })
    , resources = new Array(dataFiles.length)
    ;
  if (dataFiles.length === 0) {
    cb(null, []);
    return;
  }
  var done = function() {
    count ++;
    if (count === dataFiles.length) { 
      cb(null, resources);
    }
  }
  dataFiles.forEach(function(fp, idx) {
    exports.createResourceEntry(fp, function(err, resource) {
      // fix path in resource to be relative
      if (resource.path) {
        resource.path = path.relative(dir, resource.path);
      }
      resources[idx] = resource;
      done();
    });
  });
}

_getGitRepo = function(dir) {
  var path_ = path.join(dir, '.git', 'config');
  try {
    var gconf = fs.readFileSync(path_).toString()
    gconf = gconf.split(/\r?\n/)
    var i = gconf.indexOf('[remote "origin"]')
    if (i !== -1) {
      var u = gconf[i + 1]
      if (!u.match(/^\s*url =/)) u = gconf[i + 2]
      if (!u.match(/^\s*url =/)) u = null
      else u = u.replace(/^\s*url = /, '')
    }
    if (u && u.match(/^git@github.com:/)) {
      u = u.replace(/^git@github.com:/, 'git://github.com/')
    }
    return u;
  }
  catch (e) { 
  }
}

var _getDescriptionFromReadme = function(dir) {
  var readmePath = path.join(dir, 'README.md');
  try {
    var src = fs.readFileSync(readmePath, 'utf8');
    var description = src.split('\n').filter(function (line) {
        return /\s+/.test(line)
            && !line.trim().match(/^#/)
        ;
    })[0]
        .trim()
        .replace(/\.$/, '')
    ;
    return description;
  } catch(e) {
    return ''
  }
} 
