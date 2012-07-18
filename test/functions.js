var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  functions;

describe('functions', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/functions', {
      requires: mocks ? mocks.requires : {},
      globals: {}
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('date', function () {

    it('should return formatted date when format is specified', function () {
    });

    it('should return date with default format when format is not specified', function () {
    });
  });

  describe('include', function () {

    it('should return partial template when partial exists', function () {
    });

    it('should return error message when partial does not exist', function () {

    });
  });

  describe('relative', function () {

    it('should return path when path is at the root directory', function () {
    });

    it('should return a single upper directory when path is at a subdirectory', function () {

    });

    it('should return multiple upper directories when path is at several directories deep', function () {

    });
  });

  describe('title', function () {

    it('should return title when file exists in sitemap and it has a title', function () {
    });

    it('should return undefined when file exists in sitemap but it does not have a title', function () {

    });

    it('should return error message when file does not exist in sitemap', function () {

    });
  });
});
 

/*
var assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('params').addBatch({
  'date': {
    topic: function () {
      return sandbox.require('../lib/params', {
        globals: {
          Date: function () {
            // NOTE: 0-based month
            return new Date(2000, 9, 10);
          }
        }
      });
    },
    'when format is yyyymmdd': {
      topic: function (topic) {
        topic.params().date('yyyymmdd', this.callback);
      },
      'then it should have 8 digits length': function (result, dummy) {
        assert.equal(result.length, 8);
      },
      'and it should contain string 20001010': function (result, dummy) {
        assert.equal(result, '20001010');
      }
    },
    'when format is undefined': {
      topic: function (topic) {
        topic.params().date(undefined, this.callback);
      },
      'then it should contain description with default format': function (result, dummy) {
        assert.equal(result, 'Tue Oct 10 2000 00:00:00');
      }
    }
  },
  'include': {
    topic: function () {
      return sandbox.require('../lib/params', {
      });
    },
    'when partial file exists': {
      topic: function (topic) {
        topic.params({ partials: { 'header.html': '<div id="head"></div>' } })
          .include('header.html', this.callback);
      },
      'then it should contain the partial file\'s content': function (result, dummy) {
        assert.equal(result, '<div id="head"></div>');
      }
    },
    'when partial file does not exist': {
      topic: function (topic) {
        topic.params({ partials: {} }).include('header.html', this.callback);
      },
      'then it should contain error message': function (result, dummy) {
        assert.equal(result, '[error] partial file header.html does not exist');
      }
    }
  },
  'relative': {
    topic: function () {
      return sandbox.require('../lib/params', {
      });
    },
    'when current file is in base directory': {
      topic: function (topic) {
        topic.params({ __file: 'index.html' })
          .relative('scripts/global.js', this.callback);
      },
      'then it should not have ../ prefix': function (result, dummy) {
        assert.equal(result, 'scripts/global.js');
      }
    },
    'when current file is in sub directory': {
      topic: function (topic) {
        topic.params({ __file: 'sub/index.html' })
          .relative('scripts/global.js', this.callback);
      },
      'then it should have a single ../ prefix': function (result, dummy) {
        assert.equal(result, '../scripts/global.js');
      }
    }
  },
  'title': {
    topic: function () {
      return sandbox.require('../lib/params', {
      });
    },
    'when sitemap contains current file': {
      topic: function (topic) {
        topic.params({ __file: 'index.html',
          sitemap: { 'index.html' : { title: 'Home Page' } } })
          .title(this.callback);
      },
      'then it should contain the file title': function (result, dummy) {
        assert.equal(result, 'Home Page');
      }
    },
    'when sitemap does not contain current file': {
      topic: function (topic) {
        topic.params({ __file: 'index.html', sitemap: {} })
          .title(this.callback);
      },
      'then it should contain error message': function (result, dummy) {
        assert.equal(result, '[error] current file index.html does not have title in the sitemap');
      }
    }
  }
}).exportTo(module);
*/