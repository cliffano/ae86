var _ = require('underscore'),
  async = require('async'),
  f = require('file'),
  fs = require('fs'),
  jazz = require('jazz'),
  p = require('path'),
  prms = require('./params');

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
function _process(templates, params, cb) {
  var tasks = {},
    _templates = _.extend(templates, {});

  _.keys(_templates).forEach(function (key) {
    tasks[key] = function (cb) {
      // _templates[key] is a jazz compiled template
      _templates[key].process(params, function (data) {
        cb(null, data);
      });
    };
  });

  async.parallel(tasks, function (err, result) {
    cb(result);
  });
}

// apply params to templates
function process(dir, pages, layouts, partials, params) {
  var tasks = {};
  _.keys(pages).forEach(function (page) {
    tasks[page] = function (cb) {
      var context = { __file: page, sitemap: params.sitemap },
        _params = _.extend(params, prms.params(context));

      // evaluate partials, reset params with partials in context
      _process(partials, _params, function (result) {
        context.partials = result;
        _params = _.extend(params, prms.params(context));

        // evaluate page, assign current page as params' body
        _process({ 'currpage': pages[page] }, _params, function (result) {
          _params.body = result.currpage;

          // evaluate template - TODO: allow configurable template
          _process({ 'currlayout': layouts['default.html'] }, _params, function (result) {
            cb(null, result.currlayout);
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
exports.process = process;