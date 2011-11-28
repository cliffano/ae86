var assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('params').addBatch({
  'date function': {
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
      'then it should have 8 digits length': function (result, err) {
        assert.equal(result.length, 8);
      },
      'and it should contain string 20001010': function (result, err) {
        assert.equal(result, '20001010');
      }
    },
    'when format is undefined': {
      topic: function (topic) {
        topic.params().date(undefined, this.callback);
      },
      'then it should contain description with default format': function (result, err) {
        assert.equal(result, 'Tue Oct 10 2000 00:00:00');
      }
    }
  },
  'include function': {
    topic: function () {
      return sandbox.require('../lib/params', {
      });
    },
    'when partial file exists': {
      topic: function (topic) {
        topic.params({ partials: { 'header.html': '<div id="head"></div>' } })
          .include('header.html', this.callback);
      },
      'then it should contain the partial file\'s content': function (result, err) {
        assert.equal(result, '<div id="head"></div>');
      }
    },
    'when partial file does not exist': {
      topic: function (topic) {
        topic.params({ partials: {} }).include('header.html', this.callback);
      },
      'then it should contain error message': function (result, err) {
        assert.equal(result, '[error] partial file header.html does not exist');
      }
    }
  },
  'relative function': {
    topic: function () {
      return sandbox.require('../lib/params', {
      });
    },
    'when current file is in base directory': {
      topic: function (topic) {
        topic.params({ __file: 'index.html' })
          .relative('scripts/global.js', this.callback);
      },
      'then it should not have ../ prefix': function (result, err) {
        assert.equal(result, 'scripts/global.js');
      }
    },
    'when current file is in sub directory': {
      topic: function (topic) {
        topic.params({ __file: 'sub/index.html' })
          .relative('scripts/global.js', this.callback);
      },
      'then it should have a single ../ prefix': function (result, err) {
        assert.equal(result, '../scripts/global.js');
      }
    }
  },
  'title function': {
    topic: function () {
      return sandbox.require('../lib/params', {
      });
    },
    'when sitemap contains current file': {
      topic: function (topic) {
        topic.params({ __file: 'index.html',
          sitemap: { index: { title: 'Home Page', file: 'index.html' } } })
          .title(this.callback);
      },
      'then it should contain the file title': function (result, err) {
        assert.equal(result, 'Home Page');
      }
    },
    'when sitemap does not contain current file': {
      topic: function (topic) {
        topic.params({ __file: 'index.html', sitemap: {} })
          .title(this.callback);
      },
      'then it should contain error message': function (result, err) {
        assert.equal(result, '[error] current file index.html does not have title in the sitemap');
      }
    }
  }
}).exportTo(module);