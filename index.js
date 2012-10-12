var fs;

fs = require('fs');

module.exports = function mv(source, dest, cb){
  fs.rename(source, dest, function(err){
    var ins, outs;
    if (!err) {
      return cb();
    }
    if (err.code !== 'EXDEV') {
      return cb(err);
    }
    ins = fs.createReadStream(source);
    outs = fs.createWriteStream(dest);
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
  });
}
