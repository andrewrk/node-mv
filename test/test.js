var assert = require('assert');
var proxyquire = require('proxyquire');
var fs = require('fs');
var rimraf = require('rimraf');

describe("mv", function() {
  // makes fs.rename return cross-device error.
  var mock_fs = {};
  mock_fs.rename = function(src, dest, cb) {
    setTimeout(function() {
      var err = new Error();
      err.code = 'EXDEV';
      cb(err);
    }, 10);
  };

  it("should rename a file on the same device", function (done) {
    var mv = proxyquire.resolve('../index', __dirname, {});

    mv("test/a-file", "test/a-file-dest", function (err) {
      assert.ifError(err);
      fs.readFile("test/a-file-dest", 'utf8', function (err, contents) {
        assert.ifError(err);
        assert.strictEqual(contents, "sonic the hedgehog\n");
        // move it back
        mv("test/a-file-dest", "test/a-file", done);
      });
    });
  });

  it("should not create directory structure by default", function (done) {
    var mv = proxyquire.resolve('../index', __dirname, {});

    mv("test/a-file", "test/does/not/exist/a-file-dest", function (err) {
      assert.strictEqual(err.code, 'ENOENT');
      done();
    });
  });

  it("should create directory structure when mkdirp option set", function (done) {
    var mv = proxyquire.resolve('../index', __dirname, {});

    mv("test/a-file", "test/does/not/exist/a-file-dest", {mkdirp: true}, function (err) {
      assert.ifError(err);
      fs.readFile("test/does/not/exist/a-file-dest", 'utf8', function (err, contents) {
        assert.ifError(err);
        assert.strictEqual(contents, "sonic the hedgehog\n");
        // move it back
        mv("test/does/not/exist/a-file-dest", "test/a-file", function(err) {
          assert.ifError(err);
          rimraf("test/does", done);
        });
      });
    });
  });

  it("should work across devices", function (done) {
    var mv = proxyquire.resolve('../index', __dirname, {fs: mock_fs});
    mv("test/a-file", "test/a-file-dest", function (err) {
      assert.ifError(err);
      fs.readFile("test/a-file-dest", 'utf8', function (err, contents) {
        assert.ifError(err);
        assert.strictEqual(contents, "sonic the hedgehog\n");
        // move it back
        mv("test/a-file-dest", "test/a-file", done);
      });
    });
  });

  it("should move folders", function (done) {
    var mv = proxyquire.resolve('../index', __dirname, {});

    mv("test/a-folder", "test/a-folder-dest", function (err) {
      assert.ifError(err);
      fs.readFile("test/a-folder-dest/another-file", 'utf8', function (err, contents) {
        assert.ifError(err);
        assert.strictEqual(contents, "tails\n");
        // move it back
        mv("test/a-folder-dest", "test/a-folder", done);
      });
    });
  });

  it("should move folders across devices", function (done) {
    var mv = proxyquire.resolve('../index', __dirname, {fs: mock_fs});

    mv("test/a-folder", "test/a-folder-dest", function (err) {
      assert.ifError(err);
      fs.readFile("test/a-folder-dest/another-folder/file3", 'utf8', function (err, contents) {
        assert.ifError(err);
        assert.strictEqual(contents, "knuckles\n");
        // move it back
        mv("test/a-folder-dest", "test/a-folder", done);
      });
    });
  });
});
