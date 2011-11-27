var dateformat = require('dateformat'),
  engine = require('./engine'),
  f = require('file'),
  fs = require('fs'),
  p = require('path'),
  wrench = require('wrench');

function AE86(opts) {

  // set default options
  opts = opts || {};
  opts = {
    conf: opts.conf || 'ae86.js',
    layouts: opts.layouts || 'layouts',
    out: opts.out || 'out',
    pages: opts.pages || 'pages',
    partials: opts.partials || 'partials',
    statik: opts.statik || 'static'
  };

  // initialise website component directories
  function init() {
    f.mkdirsSync(opts.layouts);
    f.mkdirsSync(opts.pages);
    f.mkdirsSync(opts.partials);
    f.mkdirsSync(opts.statik);
  }

  // generate website pages 
  function drift() {

    // load ae86 and website's params
    var params = require(p.join(process.cwd(), 'params')).params;

    // set default params
    params.sitemap = params.sitemap || {};
    params.__genId = dateformat('yyyymmddHHMMssLl');

    console.log('Generating website...');
    f.mkdirsSync(opts.out, '0755');

    // compile and evaluate templates
    engine.compile(opts.partials, function(partials) {
      engine.compile(opts.layouts, function(layouts) {
        engine.compile(opts.pages, function(pages) {
          engine.process(opts.out, pages, layouts, partials, params);
        });
      });
    });

    // copy static files as-is
    wrench.copyDirSyncRecursive(opts.statik, opts.out);
  }

  return {
    init: init,
    drift: drift
  };
}

exports.AE86 = AE86;