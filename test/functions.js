var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  functions;

describe('functions', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/functions', {
      requires: mocks ? mocks.requires : {},
      globals: {
        Date: function () {
          return new Date(2000, 9, 10); // NOTE: 0-based month, so 10 Oct 2000
        }
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('date', function () {

    it('should return formatted date when format is specified', function (done) {
      functions = (create(checks, mocks))('somepage', {}, {});
      functions.date('yyyymmdd', function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('20001010');
    });

    it('should return date with default format when format is not specified', function (done) {
      functions = (create(checks, mocks))('somepage', {}, {});
      functions.date(undefined, function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('2000-10-10T00:00:00');
    });
  });

  describe('include', function () {

    it('should return partial template when partial exists', function (done) {
      functions = (create(checks, mocks))('somepage', {}, {});
      functions.include('somepartial', function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('[error] partial somepartial does not exist');
    });

    it('should return error message when partial does not exist', function (done) {
      functions = (create(checks, mocks))('somepage', {}, { partials: { somepartial: 'foobar' } });
      functions.include('somepartial', function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('foobar');
    });
  });

  describe('relative', function () {

    it('should return path when page is at the project root directory', function (done) {
      functions = (create(checks, mocks))('homepage.html', {}, {});
      functions.relative('somepage.html', function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('somepage.html');
    });

    it('should return a single upper directory when page is at a project subdirectory', function (done) {
      functions = (create(checks, mocks))('foo/homepage.html', {}, {});
      functions.relative('somepage.html', function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('../somepage.html');
    });

    it('should return multiple upper directories when page is at several directories deep below project directory', function (done) {
      functions = (create(checks, mocks))('foo/bar/homepage.html', {}, {});
      functions.relative('somepage.html', function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('../../somepage.html');
    });

    it('should return multiple upper directories when page and path are both at several directories deep below project directory', function (done) {
      functions = (create(checks, mocks))('foo/bar/homepage.html', {}, {});
      functions.relative('abc/xyz/somepage.html', function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('../../abc/xyz/somepage.html');
    });
  });

  describe('title', function () {

    it('should return title when file exists in sitemap and it has a title', function (done) {
      functions = (create(checks, mocks))('somepage.html', {}, { sitemap: { 'somepage.html': { title: 'foobar' } } });
      functions.title(function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('foobar');
    });

    it('should return undefined when file exists in sitemap but it does not have a title', function (done) {
      functions = (create(checks, mocks))('somepage.html', {}, { sitemap: { 'somepage.html': {} } });
      functions.title(function (data) {
        checks.data = data;
        done();
      });
      should.not.exist(checks.data);
    });

    it('should return error message when file does not exist in sitemap', function (done) {
      functions = (create(checks, mocks))('somepage.html', {}, {});
      functions.title(function (data) {
        checks.data = data;
        done();
      });
      checks.data.should.equal('[error] page somepage.html does not have any sitemap title');
    });
  });
});