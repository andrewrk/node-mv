var fs;

fs = require('fs');

module.exports = function mv(source, dest, cb){
  fs.rename(source, dest, function(err){
    var ins, outs, had_error;
    if (!err) {
      return cb();
    }
    if (err.code !== 'EXDEV') {
      return cb(err);
    }
    ins = fs.createReadStream(source);
    outs = fs.createWriteStream(dest);
    had_error = false;
    ins.on('error', function(err){
      had_error = true;
      outs.destroy();
      cb(err);
    });
    outs.on('error', function(err){
      had_error = true;
      ins.destroy();
      cb(err);
    });
    outs.on('close', function(){
      if (!had_error) cb();
      fs.unlink(source, cb);
    });
    ins.pipe(outs);
  });
}
