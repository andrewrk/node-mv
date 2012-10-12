var assert, proxyquire, fs;

assert = require('assert');
proxyquire = require('proxyquire');
fs = require('fs');

describe("mv", function() {
  it("should rename a file on the same device", function (done) {
    var mv;

    mv = proxyquire.resolve('../index', __dirname, {});

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

  it("should work across devices", function (done) {
    var mv, mock_fs;

    mock_fs = {};
    mock_fs.createReadStream = fs.createReadStream;
    mock_fs.createWriteStream = fs.createWriteStream;
    mock_fs.unlink = fs.unlink;
    mock_fs.rename = function(src, dest, cb) {
      setTimeout(function() {
        var err;
        err = new Error();
        err.code = 'EXDEV';
        cb(err);
      }, 10);
    };

    mv = proxyquire.resolve('../index', __dirname, {fs: mock_fs});
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
});
