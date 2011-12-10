var _ = require('underscore'),
  async = require('async'),
  f = require('file'),
  fs = require('fs'),
  jazz = require('jazz'),
  p = require('path'),
  prms = require('./params');

// compile all templates in a directory
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

// apply params to a set of templates
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

// process all templates, and generate the page files
function process(dir, pages, layouts, partials, params, cb) {
  var tasks = {};
  _.keys(pages).forEach(function (page) {
    tasks[page] = function (cb) {
      var context = { __file: page, sitemap: params.sitemap },
        partialsParams = _.extend(params, prms.params(context));

      // evaluate all partials with params for current context
      _process(partials, partialsParams, function (result) {
        context.partials = result;

        // evaluate all partials the second time for partials referencing other partials
        _process(partials, partialsParams, function (result) {
          context.partials = result;
          var pageParams = _.extend(params, prms.params(context));

          // evaluate page with partials-populated
          _process({ 'currpage': pages[page] }, pageParams, function (result) {
            var layoutParams = _.clone(pageParams);
            layoutParams.content = result.currpage;

            // evaluate layout with current page as its content
            var layout = (params.sitemap && params.sitemap[page] && params.sitemap[page].layout) ?
              params.sitemap[page].layout : 'default.html';
            f.mkdirs(p.join(dir, page).replace(/\/[^\/]+$/, ''), '0755', function (err) {
              _process({ 'currlayout': layouts[layout] }, layoutParams, function (result) {
                fs.writeFile(p.join(dir, page), result.currlayout, 'utf8', function (err) {
                  console.log('+ creating ' + p.join(dir, page));
                  cb(null);
                });
              });
            });
          });
        });  
      });
    };
  });

  async.parallel(tasks, function (err, results) {
    cb(err, _.keys(results));
  });
}

exports.compile = compile;
exports.process = process;