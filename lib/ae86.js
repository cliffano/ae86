"use strict"
import async from 'async';
import cpr from 'cpr';
import dateformat from 'dateformat';
import Engine from './engine.js';
import minifier from 'minifier';
import p from 'path';
import watchtree from 'watch-tree-maintained';
import wrench from 'wrench';
// console.dir(p.join(process.cwd(), 'params.js'))
// import userlandParams from p.join(process.cwd(), 'test/fixtures/params.js');

const DIRNAME = p.dirname(import.meta.url).replace('file://', '');

/**
 * class AE86
 */
class AE86 {

  constructor(opts) {
    opts = opts || {};
    this.outDir = opts.outDir || 'out';
  }

  /**
   * Create example AE86 project files in current directory.
   *
   * @param {Function} cb: standard cb(err, result) callback
   */
  init(cb) {
    cpr.cpr(p.join(DIRNAME, '../examples'), '.', cb);
  }

  /**
   * Generate website based on the templates and params.
   *
   * @param {Function} cb: standard cb(err, result) callback
   */
  generate(cb) {

    const self = this;

    function _static(cb) {
      // copy static files as-is
      cpr.cpr('static', self.outDir, (err) => {
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
        const params = {}; //userlandParams.params;
        // add website info
        params.sitemap = params.sitemap || {};
        params.__genId = dateformat('yyyymmddHHMMss');
        return params;
      }

      const engine = new Engine(),
        tasks = {};

      ['partials', 'layouts', 'pages'].forEach((dir) => {
        tasks[dir] = function (cb) {
          engine.compile(dir, cb);
        };
      });

      async.parallel(tasks, (err, results) => {
        engine.merge(self.outDir, results, _params(), cb);
      });
    }

    async.parallel([_static, _pages], cb);
  }

  /**
   * Watch for any file changes in AE86 project files.
   * A change means the project website will automatically be regenerated.
   */
  watch() {
    const SAMPLE_RATE = 5;

    const self = this;

    function _listener() {
      // no callback because the process shouldn't exit
      self.generate();
    }

    function _watch(file) {
      const watcher = watchtree.watchTree(file, {
        ignore: '\\.swp',
        'sample-rate': SAMPLE_RATE
      });
      /* eslint-disable */
      watcher.on('fileCreated', (path, stats) => {
        console.log('%s was created', file);
        _listener();
      });
      watcher.on('fileModified', (path, stats) => {
        console.log('%s was modified', file);
        _listener();
      });
      watcher.on('fileDeleted', (path) => {
        console.log('%s was deleted', file);
        self.clean();
        _listener();
      });
      /* eslint-enable */
    }

    ['static', 'partials', 'layouts', 'pages', 'params.js'].forEach(_watch);
  }

  /**
   * Remove the generated website.
   *
   * @param {Function} cb: standard cb(err, result) callback
   */
  clean(cb) {
    wrench.rmdirRecursive(this.outDir, cb);
  }
}

export {
  AE86 as default
};