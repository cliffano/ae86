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
    params: opts.params || 'params',
    layouts: opts.layouts || 'layouts',
    out: opts.out || 'out',
    pages: opts.pages || 'pages',
    partials: opts.partials || 'partials',
    statik: opts.statik || 'static'
  };

  // initialise website component directories
  function init() {
    f.mkdirsSync(opts.layouts, '0755');
    f.mkdirsSync(opts.pages, '0755');
    f.mkdirsSync(opts.partials, '0755');
    f.mkdirsSync(opts.statik, '0755');
  }

  // generate website pages 
  function gen(cwd) {

    // load ae86 and website's params
    var params = require(p.join(cwd, opts.params)).params;

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