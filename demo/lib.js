var jtsinfer = require('jts-infer')
  , createReadStream = require('filereader-stream')
  ;

var getLicense = function (licenses, id) {
  var idx = 0
    , len = licenses.length
    , license
    ;

  for (; idx < len; idx += 1) {
    if (id === licenses[idx].id) {
      license = licenses[idx];
      break;
    }
  }

  return license;
}

window.licenseOptions = [
  {
    "url": "http://www.opendefinition.org/licenses/odc-pddl",
    "title": "Open Data Commons Public Domain Dedication and Licence 1.0",
    "id": "ODC-PDDL-1.0"
  },
  {
    "url": "http://www.opendefinition.org/licenses/odc-by",
    "title": "Open Data Commons Attribution License 1.0",
    "id": "ODC-BY-1.0"
  },
  {
    "url": "http://www.opendefinition.org/licenses/odc-odbl",
    "title": "Open Data Commons Open Database License 1.0",
    "id": "ODbL-1.0"
  },
  {
    "url": "https://creativecommons.org/publicdomain/zero/1.0/",
    "title": "CC0 1.0",
    "id": "CC0-1.0"
  },
  {
    "url": "https://creativecommons.org/licenses/by/4.0/",
    "title": "Creative Commons Attribution 4.0",
    "id": "CC-BY-4.0"
  },
  {
    "url": "https://creativecommons.org/licenses/by-sa/4.0/",
    "title": "Creative Commons Attribution Share-Alike 4.0",
    "id": "CC-BY-SA-4.0"
  }
];

getSchema = function(file) {
  var def = $.Deferred();
  // domnode-filestream - get errors
  // var stream = new FileStream(f);

  // does not work properly for some reason
  // either get Uint8Array for column headings or with other options like binary or text get nothing
  // var stream = createReadStream(f, {output: 'binary'});
  var stream = createReadStream(file);
  jtsinfer(stream, function(err, schema) {
    def.resolve(file,schema);
  })
  return def.promise();
}

updateDataPackageJson = function(current, newValues, callback) {
  var files = newValues.files
    , license = newValues.license
    ;
  delete newValues.files;
  delete newValues.license;

  var out = $.extend(current, newValues);

  // sluggify title if needed
  if (!newValues.name && newValues.title) {
    out.name = out.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/--+/g, '-')
      .replace(/[^\w-]+/g, '')
      ;
  }

  if (license === '') {
    out.licenses = [{ 'url': '', 'name': '', 'id': '' }];
  } else {
    out.licenses = [getLicense(licenseOptions, license)];
  }

  out.resources = [];

  if (files && files.length > 0) {
    for(ii=0;ii<files.length;ii++) {
      var f = files[ii];
      var schema = getSchema(f);
      schema.done(function(file, schema) {
        var resource = {
          name: file.name,
          path: file.name,
          mediatype: file.type,
          bytes: file.size
        };
        resource.schema = schema;
        out.resources.push(resource);
        callback(null, out);
      });
    }
  } else {
    callback(null, out);
  }
}

