var fs = require('fs');
var ncp = require('ncp').ncp;
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

module.exports = mv;

mv.limit = 16;

function mv(source, dest, options, cb){
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  if (options.mkdirp) {
    mkdirs();
  } else {
    doRename();
  }

  function mkdirs() {
    mkdirp(path.dirname(dest), function(err) {
      if (err) return cb(err);
      doRename();
    });
  }

  function doRename() {
    fs.rename(source, dest, function(err) {
      if (!err) return cb();
      if (err.code !== 'EXDEV') return cb(err);
      fs.stat(source, function (err, stats) {
        if (err) return cb(err);
        if (stats.isFile()) {
          moveFileAcrossDevice(source, dest, cb);
        } else if (stats.isDirectory()) {
          moveDirAcrossDevice(source, dest, cb);
        } else {
          var err2;
          err2 = new Error("source must be file or directory");
          err2.code = 'NOTFILEORDIR';
          cb(err2);
        }
      });
    });
  }
}

function moveFileAcrossDevice(source, dest, cb) {
  var ins = fs.createReadStream(source);
  var outs = fs.createWriteStream(dest);
  ins.once('error', function(err){
    outs.removeAllListeners('error');
    outs.removeAllListeners('close');
    outs.destroy();
    cb(err);
  });
  outs.once('error', function(err){
    ins.removeAllListeners('error');
    outs.removeAllListeners('close');
    ins.destroy();
    cb(err);
  });
  outs.once('close', function(){
    fs.unlink(source, cb);
  });
  ins.pipe(outs);
}

function moveDirAcrossDevice(source, dest, cb) {
  ncp.limit = mv.limit;
  ncp(source, dest, function(err) {
    if (err) return cb(err);
    rimraf(source, cb);
  });
}
