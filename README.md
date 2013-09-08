[![Build Status](https://secure.travis-ci.org/superjoe30/node-mv.png)](http://travis-ci.org/superjoe30/node-mv)

Usage:
------

```js
var mv = require('mv');

mv('source/file', 'dest/file', function(err) {
  // done. it tried fs.rename first, and then falls back to
  // piping the source file to the dest file and then unlinking
  // the source file.
});
```

Another example:

```js
mv('source/dir', 'dest/a/b/c/dir', {mkdirp: true}, function(err) {
  // done. it first created all the necessary directories, and then
  // tried fs.rename, then falls back to using ncp to copy the dir
  // to dest and then rimraf to remove the source dir
});
```
