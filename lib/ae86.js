var _ = require('lodash'),
  async = require ('async'),
  cpr = require('cpr'),
  dateformat = require('dateformat'),
  Engine = require('./engine'),
  minifier = require('minifier'),
  p = require('path'),
  watchtree = require('watch-tree-maintained'),
  wrench = require('wrench');

/**
 * class AE86
 */
function AE86(opts) {
  opts = opts || {};
  this.outDir = opts.outDir || 'out';
}

/**
 * Create example AE86 project files in current directory.
 *
 * @param {Function} cb: standard cb(err, result) callback
 */
AE86.prototype.init = function (cb) {
  cpr.cpr(p.join(__dirname, '../examples'), '.', cb);
};

/**
 * Generate website based on the templates and params.
 *
 * @param {Function} cb: standard cb(err, result) callback
 */
AE86.prototype.generate = function (cb) {

  var self = this;

  function _static(cb) {
    // copy static files as-is
    cpr.cpr('static', self.outDir, function (err) {
      if (err) {
        cb(err);
      } else {
        minifier.on('error', cb);
        minifier.minify(self.outDir, { clean: true });
        cb();
      }
    });
  }

  function _pages(cb) {

    function _params() {
      // initialise userland params
      var params = require(p.join(process.cwd(), 'params')).params;
      // add website info
      params.sitemap = params.sitemap || {};
      params.__genId = dateformat('yyyymmddHHMMss');
      return params;
    }

    var engine = new Engine(),
      tasks = {};

    ['partials', 'layouts', 'pages'].forEach(function (dir) {
      tasks[dir] = function (cb) {
        engine.compile(dir, cb);
      };
    });

    async.parallel(tasks, function (err, results) {
      engine.merge(self.outDir, results, _params(), cb);
    });
  }

  async.parallel([_static, _pages], cb);
};

/**
 * Watch for any file changes in AE86 project files.
 * A change means the project website will automatically be regenerated.
 */
AE86.prototype.watch = function () {
  const SAMPLE_RATE = 5;

  var self = this;

  function _listener() {
    // remove cached params.js module so the regeneration will pick up a fresh (possibly modified) params.js
    delete require.cache[p.join(process.cwd(), 'params.js')];
    // no callback because the process shouldn't exit
    self.generate();
  }

  function _watch(file) {
    var watcher = watchtree.watchTree(file, {
      ignore: '\\.swp',
      'sample-rate': SAMPLE_RATE
    });
    watcher.on('fileCreated', function(path, stats) {
      console.log('%s was created', file);
      _listener();
    });
    watcher.on('fileModified', function(path, stats) {
      console.log('%s was modified', file);
      _listener();
    });
    watcher.on('fileDeleted', function(path) {
      console.log('%s was deleted', file);
      self.clean();
      _listener();
    });
  }

  ['static', 'partials', 'layouts', 'pages', 'params.js'].forEach(_watch);
};

/**
 * Remove the generated website.
 *
 * @param {Function} cb: standard cb(err, result) callback
 */
AE86.prototype.clean = function (cb) {
  wrench.rmdirRecursive(this.outDir, cb);
};

module.exports = AE86;
