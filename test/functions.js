var buster = require('buster-node'),
  functions = require('../lib/functions'),
  referee = require('referee'),
  assert = referee.assert;

buster.testCase('functions - date', {
  setUp: function () {
    this.useFakeTimers(new Date(2000, 9, 10).getTime());
    this.mock({});
  },
  'should return formatted date when format is specified': function (done) {
    var funcs = functions('somepage', {}, {});
    funcs.date('yyyymmdd', function (data) {
      assert.equals(data, '20001010');
      done();
    });
  },
  'should return date with default format when format is not specified': function (done) {
    var funcs = functions('somepage', {}, {});
    funcs.date(undefined, function (data) {
      assert.equals(data, '2000-10-10T00:00:00+1100');
      done();
    });
  }
});

buster.testCase('functions - include', {
  setUp: function () {
    this.mock({});
  },
  'should return partial template when partial exists': function (done) {
    var funcs = functions('somepage', {}, {});
    funcs.include('somepartial', function (data) {
      assert.equals(data, '[error] partial somepartial does not exist');
      done();
    });
  },
  'should return error message when partial does not exist': function (done) {
    var funcs = functions('somepage', {}, { partials: { somepartial: 'foobar' } });
    funcs.include('somepartial', function (data) {
      assert.equals(data, 'foobar');
      done();
    });
  }
});

buster.testCase('functions - relative', {
  setUp: function () {
    this.mock({});
  },
  'should return path when page is at the project root directory': function (done) {
    var funcs = functions('homepage.html', {}, {});
    funcs.relative('somepage.html', function (data) {
      assert.equals(data, 'somepage.html');
      done();
    });
  },
  'should return a single upper directory when page is at a project subdirectory': function (done) {
    var funcs = functions('foo/homepage.html', {}, {});
    funcs.relative('somepage.html', function (data) {
      assert.equals(data, '../somepage.html');
      done();
    });
  },
  'should return multiple upper directories when page is at several directories deep below project directory': function (done) {
    var funcs = functions('foo/bar/homepage.html', {}, {});
    funcs.relative('somepage.html', function (data) {
      assert.equals(data, '../../somepage.html');
      done();
    });
  },
  'should return multiple upper directories when page and path are both at several directories deep below project directory': function (done) {
    var funcs = functions('foo/bar/homepage.html', {}, {});
    funcs.relative('abc/xyz/somepage.html', function (data) {
      assert.equals(data, '../../abc/xyz/somepage.html');
      done();
    });
  }
});

buster.testCase('functions - title', {
  setUp: function () {
    this.mock({});
  },
  'should return title when file exists in sitemap and it has a title': function (done) {
    var funcs = functions('somepage.html', {}, { sitemap: { 'somepage.html': { title: 'foobar' } } });
    funcs.title(function (data) {
      assert.equals(data, 'foobar');
      done();
    });
  },
  'should return undefined when file exists in sitemap but it does not have a title': function (done) {
    var funcs = functions('somepage.html', {}, { sitemap: { 'somepage.html': {} } });
    funcs.title(function (data) {
      assert.equals(data, undefined);
      done();
    });
  },
  'should return error message when file does not exist in sitemap': function (done) {
    var funcs = functions('somepage.html', {}, {});
    funcs.title(function (data) {
      assert.equals(data, '[error] page somepage.html does not have any sitemap title');
      done();
    });
  }
});
