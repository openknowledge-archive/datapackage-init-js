var jtsinfer = require('jts-infer')
  , createReadStream = require('filereader-stream')
  ;

updateDataPackageJson = function(current, newValues, callback) {
  var files = newValues.files;
  delete newValues.files;

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

