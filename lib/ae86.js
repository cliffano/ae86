var async = require ('async'),
  dateformat = require('dateformat'),
  engine = require('./engine'),
  f = require('file'),
  ncp = require('ncp'),
  p = require('path'),
  watchtree = require('watch-tree');

function AE86(opts) {

  // set default options
  opts = opts || {};
  opts = {
    layouts: opts.layouts || 'layouts',
    out: opts.out || 'out',
    pages: opts.pages || 'pages',
    params: opts.params || 'params',
    partials: opts.partials || 'partials',
    statik: opts.statik || 'static'
  };

  // copy boilerplate as initial project
  function init(dir, cb) {
    ncp.ncp(dir, '.', cb);
  }

  // generate the website
  function gen(params, cb) {

    // set default params
    params.sitemap = params.sitemap || {};
    params.__genId = dateformat('yyyymmddHHMMssLl');

    async.parallel([
      function (cb) {
        // copy static files as-is
        ncp.ncp(opts.statik, opts.out, cb);
      },
      function (cb) {
        // compile and evaluate templates
        engine.compile(opts.partials, function(partials) {
          engine.compile(opts.layouts, function(layouts) {
            engine.compile(opts.pages, function(pages) {
              engine.process(opts.out, pages, layouts, partials, params, cb);
            });
          });
        });
      }], function (err, results) {
        // pass the templates result as the final result
        cb(err, results[1]);
      });
  }

  // watch for changes in project directories
  function watch(listener) {
    function watchFile(file) {
      var watcher = watchtree.watchTree(file, {
        ignore: '\\.swp',
        'sample-rate': 5
      });
      watcher.on('fileCreated', function(path, stats) {
        listener();
      });
      watcher.on('fileModified', function(path, stats) {
        listener();
      });
      watcher.on('fileDeleted', function(path) {
        listener();
      });
    }
    [opts.layouts, opts.pages, opts.params + '.js', opts.partials, opts.statik].forEach(watchFile);
  }

  return {
    init: init,
    gen: gen,
    watch: watch
  };
}

exports.AE86 = AE86;