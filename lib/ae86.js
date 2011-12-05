var async = require ('async'),
  dateformat = require('dateformat'),
  engine = require('./engine'),
  f = require('file'),
  fs = require('fs'),
  ncp = require('ncp').ncp,
  p = require('path');

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
    ncp(dir, '.', cb);
  }

  // generate the website
  function gen(params, cb) {

    // set default params
    params.sitemap = params.sitemap || {};
    params.__genId = dateformat('yyyymmddHHMMssLl');

    async.parallel([
      function (cb) {
        // copy static files as-is
        ncp(opts.statik, opts.out, cb);
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
      }], cb);
  }

  return {
    init: init,
    gen: gen
  };
}

exports.AE86 = AE86;