var _ = require('underscore'),
  dateformat = require('dateformat');

/**
 * functions
 * - page (String): current template page which these functions will be applied to
 * - sitemap (Object): sitemap configuration
 * - templates (Object): compiled templates
 *
 * Pre-defined functions which can be used as template functions.
 **/
module.exports = function (page, templates, params) {

  /**
   * functions#date
   * - format (String): date format (felixge/node-dateformat)
   * - cb (Function): jazz cb(data) callback
   *
   * Display the current date in specified format.
   * Default to ISO date when format is not specified.
   **/
  function date(format, cb) {
    cb(dateformat(new Date(), format || 'isoDateTime'));
  }

  /**
   * functions#include
   * - partial (String): partial template file to include
   * - cb (Function): jazz cb(data) callback
   *
   * Include a partial template in the current template.
   * An error message will be displayed when partial does not exist.
   **/
  function include(partial, cb) {
    cb((params.partials && params.partials[partial]) ?
      params.partials[partial] :
      '[error] partial ' + partial + ' does not exist');
  }

  // prefix page with one ../ for each parent directory
  /**
   * functions#relative
   * - cb (Function): jazz cb(data) callback
   *
   *TODO
   **/
  function relative(path, cb) {
    var value = path;
    for (var i = 0, ln = page.length; i < ln; i += 1) {
      if (page.charAt(i) === '/') {
        value = '../' + path;
      }
    }
    cb(value);
  }

  // display current page's sitemap title
  function title(cb) {
    cb(params.sitemap && params.sitemap[page] ?
      params.sitemap[page].title :
      '[error] page ' + page + ' does not have sitemap title');
  }

  return {
    date: date,
    include: include,
    relative: relative,
    title: title
  };    
}