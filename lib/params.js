var _ = require('underscore'),
  dateformat = require('dateformat');

// opts.__file: current file
// opts.sitemap: sitemap
function params(opts) {

  opts = opts || {};

  // display formatted current date
  function date(format, cb) {
    cb(dateformat(new Date(), format));
  }

  // include partial file
  function include(file, cb) {
    cb((opts.partials.hasOwnProperty(file)) ? opts.partials[file]
      : '[error] partial file ' + file + ' does not exist'
    );
  }

  // prefix file with ../s
  function relative(file, cb) {
    var i, val = file;
    for (i = 0; i < opts.__file.length; i += 1) {
      if (opts.__file.charAt(i) === '/') {
        val = '../' + val;
      }
    }
    cb(val);
  }

  // get file's sitemap title 
  function title(cb) {
    var val = '[error] current file ' + opts.__file + ' does not have title in the sitemap';
    _.keys(opts.sitemap).forEach(function (page) {
      if (opts.sitemap[page].file === opts.__file) {
        val = opts.sitemap[page].title;
      }
    });
    cb(val);
  }

  return {
    date: date,
    include: include,
    relative: relative,
    title: title
  };
}

exports.params = params;