var async = require ('async'),
  dateformat = require('dateformat'),
  engine = require('./engine'),
  f = require('file'),
  fs = require('fs'),
  wrench = require('wrench');

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

  // initialise website component directories
  function init(cb) {
    async.parallel([
        function (cb) {
          f.mkdirs(opts.layouts, '0755', function (err) {
            cb(null, opts.layouts);
          });
        },
        function (cb) {
          f.mkdirs(opts.pages, '0755',  function (err) {
            cb(null, opts.pages);
          });
        },
        function (cb) {
          f.mkdirs(opts.partials, '0755',  function (err) {
            cb(null, opts.partials);
          });
        },
        function (cb) {
          f.mkdirs(opts.statik, '0755',  function (err) {
            cb(null, opts.statik);
          });
        },
        function (cb) {
          var data = 'exports.params = {\n};';
          fs.writeFile(opts.params + '.js', data, 'utf8', function (err) {
            cb(null, opts.params + '.js');
          });
        }
      ], cb);
  }

  // generate website pages 
  function gen(params) {

    // set default params
    params.sitemap = params.sitemap || {};
    params.__genId = dateformat('yyyymmddHHMMssLl');

    console.log('Generating website...');
    
    // copy static files as-is
    wrench.copyDirSyncRecursive(opts.statik, opts.out);

    // compile and evaluate templates
    engine.compile(opts.partials, function(partials) {
      engine.compile(opts.layouts, function(layouts) {
        engine.compile(opts.pages, function(pages) {
          engine.process(opts.out, pages, layouts, partials, params);
        });
      });
    });
  }

  return {
    init: init,
    gen: gen
  };
}

exports.AE86 = AE86;