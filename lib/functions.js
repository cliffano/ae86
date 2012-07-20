var _ = require('underscore'),
  dateformat = require('dateformat');

/**
 * functions
 * - page (String): current page which these functions will be applied to
 * - templates (Object): compiled jazz templates
 * - params (Object): template parameters (including user-defined parameters and custom functions)
 *
 * Pre-defined functions which can be used as template functions.
 * When these functions are applied to the current page, it uses page + templates + params as its context.
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
   * Include a partial template in the current page.
   * An error message will be included when partial does not exist.
   **/
  function include(partial, cb) {
    cb((params.partials && params.partials[partial]) ?
      params.partials[partial] :
      '[error] partial ' + partial + ' does not exist');
  }

  /**
   * functions#relative
   * - path (String): a URL path in the site navigation
   * - cb (Function): jazz cb(data) callback
   *
   * Prefix path with one ../ for each parent directory of the page.
   * This is used to construct static links from various directory level in the website.
   **/
  function relative(path, cb) {
    var value = path;
    for (var i = 0, ln = page.length; i < ln; i += 1) {
      if (page.charAt(i) === '/') {
        value = '../' + value;
      }
    }
    cb(value);
  }

  /**
   * functions#relative
   * - cb (Function): jazz cb(data) callback
   *
   * Display current page's sitemap title.
   **/
  function title(cb) {
    cb((params.sitemap && params.sitemap[page]) ?
      params.sitemap[page].title :
      '[error] page ' + page + ' does not have any sitemap title');
  }

  return {
    date: date,
    include: include,
    relative: relative,
    title: title
  };    
}