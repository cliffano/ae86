var _ = require('underscore'),
  dateformat = require('dateformat');

// opts.__file: current file
// opts.sitemap: sitemap
function params(opts) {

	// display formatted current date
	function date(format, cb) {
		cb(dateformat(new Date(), format));
	}

  // include partial file
	function include(file, cb) {
		cb(opts.partials[file]);
	}

	// prefix file with ../s
	function relative(file, cb) {
		var i, relative = file;
		for (i = 0; i < opts.__file.length; i += 1) {
		  if (opts.__file.charAt(i) === '/') {
		    relative = '../' + relative;
		  }
		}
		cb(relative);
	}

	// get file's sitemap title 
	function title(cb) {
		var title;
		_.keys(opts.sitemap).forEach(function (page) {
			if (opts.sitemap[page].file === opts.__file) {
				title = opts.sitemap[page].title;
			}
		});
		cb(title);
	}

  return {
	  date: date,
	  include: include,
	  relative: relative,
	  title: title
	};
}

exports.params = params;