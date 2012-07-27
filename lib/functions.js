var _ = require('underscore'),
  dateformat = require('dateformat');

/**
 * Pre-defined functions which can be used as template functions.
 * When these functions are applied to the current page, it uses page + templates + params as its context.
 *
 * @param {String} page: current page which these functions will be applied to
 * @param {Object} templates: compiled jazz templates
 * @param {Object} params: template parameters (including user-defined parameters and custom functions)
 */
module.exports = function (page, templates, params) {

  /**
   * Display the current date in specified format.
   * Default to ISO date when format is not specified.
   *
   * @param {String} format: date format (felixge/node-dateformat)
   * @param {Function} cb: jazz cb(data) callback
   */
  function date(format, cb) {
    cb(dateformat(new Date(), format || 'isoDateTime'));
  }

  /**
   * Include a partial template in the current page.
   * An error message will be included when partial does not exist.
   *
   * @param {String} partial: partial template file to include
   * @param {Function} cb: jazz cb(data) callback
   */
  function include(partial, cb) {
    cb((params.partials && params.partials[partial]) ?
      params.partials[partial] :
      '[error] partial ' + partial + ' does not exist');
  }

  /**
   * Prefix path with one ../ for each parent directory of the page.
   * This is used to construct static links from various directory level in the website.
   *
   * @param {String} path: a URL path in the site navigation
   * @param {Function} cb: jazz cb(data) callback
   */
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
   * Display current page's sitemap title.
   *
   * @param {Function} cb: jazz cb(data) callback
   */
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
};
