var async = require ('async'),
  dateformat = require('dateformat'),
  engine = require('./engine'),
  f = require('file'),
  fs = require('fs'),
  p = require('path'),
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
          console.log('+ creating ' + opts.layouts);
          f.mkdirs(opts.layouts, '0755', function (err) {
            var file = p.join(opts.layouts, 'default.html'),
              data = '{body}';
            console.log('+ creating ' + file);
            fs.writeFile(file, data, 'utf8', function (err) {
              cb(null, [opts.layouts, file]);
            });
          });
        },
        function (cb) {
          console.log('+ creating ' + opts.pages);
          f.mkdirs(opts.pages, '0755',  function (err) {
            var file = p.join(opts.pages, 'index.html'),
              data = '';
            console.log('+ creating ' + file);
            fs.writeFile(file, data, 'utf8', function (err) {
              cb(null, [opts.pages, file]);
            });
          });
        },
        function (cb) {
          console.log('+ creating ' + opts.partials);
          f.mkdirs(opts.partials, '0755',  function (err) {
            cb(null, [opts.partials]);
          });
        },
        function (cb) {
          console.log('+ creating ' + opts.statik);
          f.mkdirs(opts.statik, '0755',  function (err) {
            cb(null, [opts.statik]);
          });
        },
        function (cb) {
          var file = opts.params + '.js';
          var data = 'exports.params = {\n  sitemap: {\n    \'index.html\': { title: \'Home\' }\n  }\n};';
          console.log('+ creating ' + file);
          fs.writeFile(file, data, 'utf8', function (err) {
            cb(null, [file]);
          });
        }
      ], function (err, results) {
        cb(err);
      });
  }

  // generate website pages 
  function gen(params, cb) {

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
          engine.process(opts.out, pages, layouts, partials, params, cb);
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