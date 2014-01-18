var dpm = require('../index')
  , assert = require('assert')
  ;

describe('basics', function(){
  it('findDataFiles CSV OK', function() {
    var out = dpm.findDataFiles('test/data/dp1');
    assert.deepEqual(['data.csv'], out);
  });
  it('findDataFiles GeoJSON OK', function() {
    var out = dpm.findDataFiles('test/data/dp2');
    assert.deepEqual(['data.geojson'], out);
  });
  it('createResourceEntry OK', function(done) {
    var fp = 'test/data/dp1/data.csv';
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
    var fp = 'test/data/dp2/data.geojson';
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
    dpm.createResourceEntries('test/data/dp1', function(err, out) {
      assert.equal(out.length, 1);
      assert.equal(out[0].name, 'data');
      done();
    });
  });
});

