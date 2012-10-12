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
});
