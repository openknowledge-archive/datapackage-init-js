var jtsinfer = require('jts-infer')
  , createReadStream = require('filereader-stream')
  , http = require('http')
  , licenseTemplate = { 'url': '', 'name': '', 'id': '' }
  , licenses = []
  ;

(function initializeLicenses() {
  var ids = [
        'ODC-PDDL-1.0',
        'ODC-BY-1.0',
        'ODbL-1.0',
        'CC0-1.0',
        'CC-BY-4.0',
        'CC-BY-SA-4.0'
      ];

  $.each(ids, function (_, id) {
    http.get({
      host: 'api.github.com',
      port: 443,
      path: '/repos/okfn/licenses/contents/licenses/' + id + '.json',
      withCredentials: false
    }, function(response) {
      response.on('data', function (chunk) {
        json = JSON.parse(chunk);
        bin64 = json.content;
        buf = new Buffer(bin64, 'base64');
        lic = JSON.parse(buf.toString());
        licenses.push({ 'url': lic.url, 'name': lic.title, 'id': lic.id });
      });
    });
  });
}());

var getLicense = function (id) {
  var idx = 0
    , len = licenses.length
    , license = licenseTemplate
    ;

  for (; idx < len; idx += 1) {
    if (id === licenses[idx].id) {
      license = licenses[idx];
      break;
    }
  }

  return license;
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
    out.licenses = [licenseTemplate];
  } else {
    out.licenses = [getLicense(license)];
  }

  out.resources = [];

  if (files && files.length > 0) {
    for(ii=0;ii<files.length;ii++) {
      var f = files[ii];
      console.log(f);
      var resource = {
        name: f.name,
        path: f.name,
        mediatype: f.type,
        bytes: f.size
      };

      // domnode-filestream - get errors
      // var stream = new FileStream(f);

      // does not work properly for some reason
      // either get Uint8Array for column headings or with other options like binary or text get nothing
      // var stream = createReadStream(f, {output: 'binary'});
      var stream = createReadStream(f);
      jtsinfer(stream, function(err, schema) {
        console.log(schema);
        resource.schema = schema;
        out.resources.push(resource);
        callback(null, out);
      })
    }
  } else {
    callback(null, out);
  }
}

