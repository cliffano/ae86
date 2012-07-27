var _ = require('underscore'),
  async = require ('async'),
  dateformat = require('dateformat'),
  engine = require('./engine'),
  ncp = require('ncp'),
  p = require('path'),
  watchtree = require('watch-tree-maintained'),
  wrench = require('wrench');

/**
 * class AE86
 */
function AE86() {
}

/**
 * Create example AE86 project files in current directory.
 *
 * @param {Function} cb: standard cb(err, result) callback
 */
AE86.prototype.init = function (cb) {

  console.log('Creating example AE86 project');
  ncp.ncp(p.join(__dirname, '../examples'), '.', cb);
};

/**
 * Generate website based on the templates and params.
 *
 * @param {Function} cb: standard cb(err, result) callback
 */
AE86.prototype.generate = function (cb) {

  console.log('Generating website');

  function _params() {

    // initial userland params
    var params = require(p.join(process.cwd(), 'params')).params;

    // set defaults
    params.sitemap = params.sitemap || {};
    params.__genId = dateformat('yyyymmddHHMMssLl');

    return params;
  }

  function _static(cb) {
    // copy static files as-is
    ncp.ncp('static', 'out', cb);
  }

  function _pages(cb) {

    var _engine = new engine('html'),
      tasks = {};

    ['partials', 'layouts', 'pages'].forEach(function (dir) {
      tasks[dir] = function (cb) {
        _engine.compile(dir, cb);
      };
    });

    async.parallel(tasks, function (err, results) {
      _engine.merge('out', results, _params(), cb);
    });
  }

  async.parallel([_static, _pages], cb);
};

/**
 * Watch for any file changes in AE86 project files.
 * A detected change means the project needs to be regenerated.
 *
 * @param {Function} cb: standard cb(err, result) callback, this callback is never called because watch is not meant to exit
 */
AE86.prototype.watch = function (cb) {

  console.log('Watching for changes and automatically regenerating website');

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
      'sample-rate': 5
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

  console.log('Removing website');
  wrench.rmdirRecursive('out', cb);
};

module.exports = AE86;
