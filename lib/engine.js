var _ = require('lodash'),
  async = require('async'),
  cheerio = require('cheerio'),
  mkdirp = require('mkdirp'),
  f = require('file'),
  fs = require('fs'),
  functions = require('./functions'),
  jazz = require('jazz'),
  p = require('path'),
  util = require('util');

/**
 * class Engine
 *
 * @param {String} opts: optional
 * - ext: template file extension, files without this extension will be ignored.
 * - mkdirp: temporary used for testing only, need to figure out how to mock required function using Sinon
 */
function Engine(opts) {
  opts = opts || {};
  this.ext = opts.ext || 'html';
  mkdirp = opts.mkdirp || mkdirp;
  this.version = require('./../package.json').version;
}

/**
 * Compile all template files (identified by file extension) in a directory.
 * This can be done in parallel because compiling a template does not depend on other templates.
 *
 * @param {String} dir: directory containing the templates
 * @param {Function} cb: standard cb(err, result) callback
 */
Engine.prototype.compile = function (dir, cb) {

  var tasks = {},
    self = this;

  function _task(base, file) {
    var baseFile = p.join(base, file),
      baseUrlPath = baseFile.replace(/\\/g, '/');
    tasks[baseUrlPath.substr(baseUrlPath.indexOf('/') + 1)] = function (cb) {
      fs.readFile(baseFile, 'utf8', function (err, result) {
        cb(err, jazz.compile(result));
      });
    };
  }

  f.walkSync(dir, function (base, dirs, files) {
    files.forEach(function (file) {
      if (file.match(new RegExp('\\.' + self.ext))) {
        _task(base, file);
      }
    });
  });

  async.parallel(tasks, cb);
};

/**
 * Compile all template files (identified by file extension) in a directory.
 * This can be done in parallel because compiling a template does not depend on other templates.
 *
 * @param {String} dir: output directory where website files will be written to
 * @param {Object} templates: compiled jazz templates
 * @param {Object} params: template parameters and functions
 * @param {Function} cb: standard cb(err, result) callback
 */
Engine.prototype.merge = function (dir, templates, params, cb) {

  var self = this;

  // merge a set of params to a set of templates
  function _process(templates, params, cb) {
    var _templates = _.extend(templates, {}), // process template copies, not the originals
      tasks = {};

    _.keys(_templates).forEach(function (key) {
      tasks[key] = function (cb) {
        _templates[key].process(params, function (data) {
          cb(null, data);
        });
      };
    });

    async.parallel(tasks, function (err, results) {
      cb(results);
    });
  }

  var tasks = {};

  _.keys(templates.pages).forEach(function (page) {
    tasks[page] = function (cb) {

      var pageParams = _.extend(_.extend({}, params), functions(page, templates, params)),
        pageContent;

      function _mergePartials(cb) {
        _process(templates.partials, pageParams, function (result) {
          pageParams.partials = result;
          pageParams = _.extend(pageParams, functions(page, templates, pageParams));
          _process(templates.partials, pageParams, function (result) {
            pageParams.partials = result;
            cb();
          });
        });
      }

      function _mergePage(cb) {
        _process({ currpage: templates.pages[page] }, pageParams, function (result) {
          pageParams.content = result.currpage;
          cb();
        });
      }

      function _mergeLayout(cb) {
        var layout = (pageParams.sitemap && pageParams.sitemap[page] && pageParams.sitemap[page].layout) ? pageParams.sitemap[page].layout : 'default.html';
        _process({ currlayout: templates.layouts[layout] }, pageParams, function (result) {
          $ = cheerio.load(result.currlayout);
          $('head').append(util.format('<meta name="generator" content="AE86 %s" />', self.version));
          pageContent = $.html();
          cb();
        });
      }

      function _writePage(cb) {
        mkdirp(p.join(dir, page).replace(/(\/[^\/]+$|\\[^\\]+$)/, ''), '0755', function (err) {
          if (!err) {
            fs.writeFile(p.join(dir, page), pageContent, 'utf8', function (err) {
              if (!err) {
                console.log('+ creating %s', p.join(dir, page));
              }
              cb(err);
            });
          } else {
            cb(err);
          }
        });
      }

      async.series([_mergePartials, _mergePage, _mergeLayout, _writePage], cb);
    };
  });

  async.parallel(tasks, function (err, results) {
    cb(err, _.keys(results));
  });
};

module.exports = Engine;
