"use strict"
import _ from 'lodash';
import async from 'async';
import cheerio from 'cheerio';
import mkdirp from 'mkdirp';
import f from 'file';
import fs from 'fs';
import functions from './functions.js';
import jazz from 'jazz';
import p from 'path';
import util from 'util';

const DIRNAME = p.dirname(import.meta.url).replace('file://', '');

/**
 * class Engine
 */
class Engine {

  /**
   * @param {String} opts: optional
   * - ext: template file extension, files without this extension will be ignored.
   */
  constructor(opts) {
    opts = opts || {};
    this.ext = opts.ext || 'html';
    this.version = JSON.parse(fs.readFileSync(p.join(DIRNAME, '../package.json'))).version;
  }

  /**
   * Compile all template files (identified by file extension) in a directory.
   * This can be done in parallel because compiling a template does not depend on other templates.
   *
   * @param {String} dir: directory containing the templates
   * @param {Function} cb: standard cb(err, result) callback
   */
  compile(dir, cb) {

    const tasks = {},
      self = this;

    function _task(base, file) {
      const baseFile = p.join(base, file);
      const baseUrlPath = baseFile.replace(/\\/g, '/');
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
  }

  /**
   * Compile all template files (identified by file extension) in a directory.
   * This can be done in parallel because compiling a template does not depend on other templates.
   *
   * @param {String} dir: output directory where website files will be written to
   * @param {Object} templates: compiled jazz templates
   * @param {Object} params: template parameters and functions
   * @param {Function} cb: standard cb(err, result) callback
   */
  merge(dir, templates, params, cb) {

    const self = this;

    // merge a set of params to a set of templates
    function _process(templates, params, cb) {
      const _templates = _.extend(templates, {}), // process template copies, not the originals
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

    const tasks = {};

    _.keys(templates.pages).forEach(function (page) {
      tasks[page] = function (cb) {

        let pageParams = _.extend(_.extend({}, params), functions(page, templates, params));
        let pageContent;

        function _mergePartials(cb) {
          _process(templates.partials, pageParams, result => {
            pageParams.partials = result;
            pageParams = _.extend(pageParams, functions(page, templates, pageParams));
            _process(templates.partials, pageParams, result => {
              pageParams.partials = result;
              cb();
            });
          });
        }

        function _mergePage(cb) {
          _process({ currpage: templates.pages[page] }, pageParams, result => {
            pageParams.content = result.currpage;
            cb();
          });
        }

        function _mergeLayout(cb) {
          const layout = (pageParams.sitemap && pageParams.sitemap[page] && pageParams.sitemap[page].layout) ? pageParams.sitemap[page].layout : 'default.html';
          _process({ currlayout: templates.layouts[layout] }, pageParams, result => {
            const $ = cheerio.load(result.currlayout);
            $('head').append(util.format('<meta name="generator" content="AE86 %s" />', self.version));
            pageContent = $.html();
            cb();
          });
        }

        function _writePage(cb) {
          // eslint-disable-next-line no-useless-escape
          mkdirp.sync(p.join(dir, page).replace(/(\/[^\/]+$|\\[^\\]+$)/, ''));
          fs.writeFile(p.join(dir, page), pageContent, 'utf8', function (err) {
            if (!err) {
              console.log('+ creating %s', p.join(dir, page));
            }
            cb(err);
          });
        }

        async.series([_mergePartials, _mergePage, _mergeLayout, _writePage], cb);
      };
    });

    async.parallel(tasks, function (err, results) {
      cb(err, _.keys(results));
    });
  }
}

export {
  Engine as default
};
