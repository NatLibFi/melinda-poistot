var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

var buildDir = path.resolve(__dirname, '../build');
var publicDir = path.resolve(buildDir, 'public');

rimraf(buildDir, function (err) {
  if (err) {
    throw err;
  }

  if (process.argv.indexOf('createdir') >= 0) {
    fs.mkdirSync(buildDir);
    fs.mkdirSync(publicDir);
  }
});
