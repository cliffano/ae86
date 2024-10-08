"use strict";
/* eslint no-unused-vars: 0 */
import functions from '../lib/functions.js';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
const assert = referee.assert;

describe('functions - date', function() {

  beforeEach(function () {
    this.clock = sinon.useFakeTimers(new Date(2000, 9, 10).getTime());
  });

  afterEach(function () {
    this.clock.restore();
  });

  it('should return formatted date when format is specified', function (done) {
    const funcs = functions('somepage', {}, {});
    funcs.date('yyyymmdd', function (data) {
      assert.equals(data, '20001010');
      done();
    });
  });

  it('should return date with default format when format is not specified', function (done) {
    const funcs = functions('somepage', {}, {});
    funcs.date(undefined, function (data) {
      assert.isObject(data.match(/2000-10-10T00:00:00+..../));
      done();
    });
  });
});

describe('functions - include', function() {

  it('should return partial template when partial exists', function (done) {
    const funcs = functions('somepage', {}, {});
    funcs.include('somepartial', function (data) {
      assert.equals(data, '[error] partial somepartial does not exist');
      done();
    });
  });

  it('should return error message when partial does not exist', function (done) {
    const funcs = functions('somepage', {}, { partials: { somepartial: 'foobar' } });
    funcs.include('somepartial', function (data) {
      assert.equals(data, 'foobar');
      done();
    });
  });
});

describe('functions - relative', function() {

  it('should return path when page is at the project root directory', function (done) {
    const funcs = functions('homepage.html', {}, {});
    funcs.relative('somepage.html', function (data) {
      assert.equals(data, 'somepage.html');
      done();
    });
  });

  it('should return a single upper directory when page is at a project subdirectory', function (done) {
    const funcs = functions('foo/homepage.html', {}, {});
    funcs.relative('somepage.html', function (data) {
      assert.equals(data, '../somepage.html');
      done();
    });
  });

  it('should return multiple upper directories when page is at several directories deep below project directory', function (done) {
    const funcs = functions('foo/bar/homepage.html', {}, {});
    funcs.relative('somepage.html', function (data) {
      assert.equals(data, '../../somepage.html');
      done();
    });
  });

  it('should return multiple upper directories when page and path are both at several directories deep below project directory', function (done) {
    const funcs = functions('foo/bar/homepage.html', {}, {});
    funcs.relative('abc/xyz/somepage.html', function (data) {
      assert.equals(data, '../../abc/xyz/somepage.html');
      done();
    });
  });
});

describe('functions - title', function() {

  it('should return title when file exists in sitemap and it has a title', function (done) {
    const funcs = functions('somepage.html', {}, { sitemap: { 'somepage.html': { title: 'foobar' } } });
    funcs.title(function (data) {
      assert.equals(data, 'foobar');
      done();
    });
  });

  it('should return undefined when file exists in sitemap but it does not have a title', function (done) {
    const funcs = functions('somepage.html', {}, { sitemap: { 'somepage.html': {} } });
    funcs.title(function (data) {
      assert.isUndefined(data);
      done();
    });
  });

  it('should return error message when file does not exist in sitemap', function (done) {
    const funcs = functions('somepage.html', {}, {});
    funcs.title(function (data) {
      assert.equals(data, '[error] page somepage.html does not have any sitemap title');
      done();
    });
  });
});
