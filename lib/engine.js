var _ = require('underscore'),
  async = require('async'),
  f = require('file'),
  fs = require('fs'),
  jazz = require('jazz'),
  p = require('path');

// compile all template files in a directory
function compile(dir, cb) {

  var tasks = {};

  f.walkSync(dir, function (base, dirs, files) {
    files.forEach(function (file) {
      if (file.match(/\.html$/)) {
        var baseFile = p.join(base, file);
        tasks[baseFile.substr(baseFile.indexOf('/') + 1)] = function (cb) {
          fs.readFile(baseFile, 'utf8', function (err, result) {
            cb(null, jazz.compile(result));
          });
        };            
      }
    });
  });

  async.parallel(tasks, function (err, result) {
    cb(result);
  });
}

// evaluate templates
function _eval(templates, params, cb) {
  var tasks = {},
    _templates = _.extend(templates, {});

  _.keys(_templates).forEach(function (key) {
    tasks[key] = function (cb) {
      _templates[key].eval(params, function (data) {
        cb(null, data);
      });
    }
  });

  async.parallel(tasks, function (err, result) {
    cb(result);
  });
}

// apply params to templates
function eval(dir, pages, layouts, partials, params) {
  var tasks = {};

  _.keys(pages).forEach(function (page) {
    tasks[page] = function (cb) {
      var context = {
          __file: page,
          sitemap: params.sitemap
        },
        _params = _.extend(params, require('./params').params(context));

      // evaluate partials
      _eval(partials, _params, function (result) {
        // reset params with partials in context
        context.partials = result;
        _params = _.extend(params, require('./params').params(context));

        // evaluate page
        pages[page].eval(_params, function (data) {
          _params.body = data;

          // evaluate template - TODO: allow configurable template
          layouts['default.html'].eval(_params, function (result) {
            cb(null, result);
          });
        });
      });
    };
  });

  async.parallel(tasks, function(err, result) {
    _.keys(result).forEach(function (page) {
      fs.writeFile(p.join(dir, page), result[page], 'utf8', function (err) {
        console.log('+ ' + page);
      });
    });
  });
}

exports.compile = compile;
exports.eval = eval;