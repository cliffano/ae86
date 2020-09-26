"use strict"
import async from 'async';
import cpr from 'cpr';
import dateformat from 'dateformat';
import Engine from './engine.js';
import fs from 'fs';
import p from 'path';
import watch from '@cnakazawa/watch';
import wrench from 'wrench';

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
      cpr.cpr('static', self.outDir, cb);
    }

    function _pages(cb) {

      function _params(cb) {

        function prepParams(result) {
          const params = result.params;
          // add website info
          params.sitemap = params.sitemap || {};
          params.__genId = dateformat('yyyymmddHHMMss');
          cb(null, params);
        }

        // initialise userland params
        const paramsFile = p.join(process.cwd(), 'params.js');
        if (fs.existsSync(paramsFile)) {
          import(paramsFile)
            .then(result => prepParams(result))
            .catch(err => cb(err));
        } else {
          cb(null, null);
        }
      }

      const engine = new Engine(),
        tasks = {};

      ['partials', 'layouts', 'pages'].forEach((dir) => {
        tasks[dir] = function (cb) {
          engine.compile(dir, cb);
        };
      });

      async.parallel(tasks, (err, results) => {
        function prepParams(err, result) {
          if (err) {
            cb(err);
          } else {
            engine.merge(self.outDir, results, result || {}, cb);
          }
        }
        _params(prepParams);
      });
    }

    async.parallel([_static, _pages], cb);
  }

  /**
   * Watch for any file changes in AE86 project files.
   * A change means the project website will automatically be regenerated.
   */
  watch() {
    const self = this;

    function _listener() {
      // no callback because the process shouldn't exit
      self.generate();
    }

    function _watch(file) {
      watch.watchTree(file, function (f, curr, prev) {
        if (typeof f === "object" && prev === null && curr === null) {
          console.log('Watching for file changes...')
        } else if (prev === null) {
          console.log('%s was created', file);
          _listener();
        } else if (curr.nlink === 0) {
          console.log('%s was deleted', file);
          self.clean();
          _listener();
        } else {
          console.log('%s was modified', file);
          _listener();
        }
      });
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