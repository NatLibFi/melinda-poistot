/**
 * This script copies frontend/index.html into build/public/index.html
 */

/*eslint-disable no-console */

var fs = require('fs');
var colors = require('colors');
var cheerio = require('cheerio');

fs.readFile('frontend/index.html', 'utf8', (err, markup) => {
  if (err) {
    return console.log(err);
  }

  const $ = cheerio.load(markup);

  // Since a separate spreadsheet is only utilized for the production build, need to dynamically add this here.
  $('head').append('<link rel="stylesheet" href="/css/app.css">');

  fs.writeFile('build/public/index.html', $.html(), 'utf8', function (err) {
    if (err) {
      return console.log(err);
    }
  });

  console.log('index.html written to /build/public'.green);
});


fs.readFile('frontend/favicon.png', (err, data) => {
  if (err) {
    return console.log(err);
  }

  fs.writeFile('build/public/favicon.png', data, function (err) {
    if (err) {
      return console.log(err);
    }
  });

  console.log('favicon.png written to /build/public'.green);
});
