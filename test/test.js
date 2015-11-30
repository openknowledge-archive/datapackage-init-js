var path = require('path')
  , fs = require('fs')
  , rimraf = require('rimraf')
  , assert = require('assert')
  , dpm = require('../index')
  ;

describe('init', function(){
  it('init OK', function(done) {
    var path_ = '/tmp/test-data-package-init'
    if (fs.existsSync(path_)) {
      rimraf.sync(path_);
    }
    fs.mkdirSync(path_);
    var dpjsonPath = path.join(path_, 'datapackage.json');
    dpm.init(path_, function(err, dpjson) {
      assert(fs.existsSync(dpjsonPath));
      var outdp = JSON.parse(fs.readFileSync(dpjsonPath));
      assert.equal(outdp.name, 'test-data-package-init');
      done();
    });
  });
});

describe('create', function(){
  it('update existing datapackage.json', function(done) {
    var path_ = 'test/fixtures/dp1';
    dpm.create(path_, function(err, dpjson) {
      console.log(dpjson);
      assert.equal(dpjson.name, 'dp1-test-it');
      assert.equal(dpjson.license, 'ODC-PDDL-1.0');
      assert.equal(dpjson.resources.length, 2);
      assert.equal(dpjson.resources[1].path, 'data.csv');
      done();
    });
  });
});

describe('defaults', function(){
  it('getDefaults OK', function(done) {
    var dpjson = dpm.simpleDefaults();
    assert.equal(dpjson.name, 'my-data-package');
    assert.equal(dpjson.version, '0.1.0');
    assert.equal(dpjson.license, 'ODC-PDDL-1.0');
    done();
  });
  it('getDefaultsForFilePath OK', function(done) {
    dpm.defaultsForLocalPackage('test/fixtures/dp1', function(err, dpjson) {
      assert.equal(dpjson.version, '0.1.0');
      assert.equal(dpjson.name, 'dp1');
      assert.equal(dpjson.description, 'This is a data package');
      assert.equal(dpjson.resources[0].path, 'data.csv');
      // TODO: test git stuff etc
      done();
    });
  });
});

describe('basics', function(){
  it('findDataFiles CSV OK', function() {
    var out = dpm.findDataFiles('test/fixtures/dp1');
    assert.deepEqual(['data.csv'], out);
  });
  it('findDataFiles GeoJSON OK', function() {
    var out = dpm.findDataFiles('test/fixtures/dp2');
    assert.deepEqual(['data.geojson'], out);
  });
  it('createResourceEntry OK', function(done) {
    var fp = 'test/fixtures/dp1/data.csv';
    dpm.createResourceEntry(fp, function(err, out) {
      var exp = {
        name: 'data',
        path: fp,
        format: 'csv',
        mediatype: 'text/csv',
        bytes: 48,
        schema: {
          fields: [
            {
              name: 'date',
              type: 'date',
              description: ''
            },
            {
              name: 'value',
              type: 'number',
              description: ''
            }
          ]
        }
      }
      assert.deepEqual(JSON.stringify(out, null, 2), JSON.stringify(exp, null, 2));
      done();
    });
  });
  it('createResourceEntry GeoJSON OK', function(done) {
    var fp = 'test/fixtures/dp2/data.geojson';
    dpm.createResourceEntry(fp, function(err, out) {
      var exp = {
        name: 'data',
        path: fp,
        format: 'geojson',
        mediatype: 'application/json',
        bytes: 4
      }
      assert.deepEqual(JSON.stringify(out, null, 2), JSON.stringify(exp, null, 2));
      done();
    });
  });
  it('createResourceEntries OK', function(done) {
    dpm.createResourceEntries('test/fixtures/dp1', function(err, out) {
      assert.equal(out.length, 1);
      assert.equal(out[0].name, 'data');
      done();
    });
  });
});

