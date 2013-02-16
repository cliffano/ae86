var bag = require('bagofholding'),
  buster = require('buster'),
  Engine = require('../lib/engine'),
  f = require('file'),
  fs = require('fs'),
  jazz = require('jazz');

buster.testCase('engine - engine', {
  'should use default ext when optional ext is not specified': function () {
    var engine = new Engine();
    assert.equals(engine.ext, 'html');
  },
  'should use specified ext': function () {
    var engine = new Engine({ ext: 'someext' });
    assert.equals(engine.ext, 'someext');
  }
});

buster.testCase('engine - compile', {
  setUp: function () {
    this.mockFs = this.mock(fs);
    this.engine = new Engine();
  },
  'should compile files with the specified file extension': function (done) {
    this.mockFs.expects('readFile').withArgs('/somebasedir/foo.html', 'utf8').callsArgWith(2, null, 'foo');
    this.mockFs.expects('readFile').withArgs('/somebasedir/sub/dir/bar.html', 'utf8').callsArgWith(2, null, 'bar');
    this.stub(f, 'walkSync', function (dir, cb) {
      assert.equals(dir, 'sometemplatedir');
      cb('/somebasedir', [], [ 'foo.html', 'sub/dir/bar.html', '.git', 'abc.txt' ]);
    });
    this.engine.compile('sometemplatedir', function (err, result) {
      assert.isNull(err);
      assert.defined(result['somebasedir/foo.html']);
      assert.defined(result['somebasedir/sub/dir/bar.html']);
      done();
    });
  },
  'should compile files with windows file path separator (backslashes) and have url path separator (slashes)': function (done) {
    this.mockFs.expects('readFile').withArgs('/somebasedir/foo.html', 'utf8').callsArgWith(2, null, 'foo');
    this.mockFs.expects('readFile').withArgs('/somebasedir/sub\\dir\\bar.html', 'utf8').callsArgWith(2, null, 'bar');
    this.stub(f, 'walkSync', function (dir, cb) {
      assert.equals(dir, 'sometemplatedir');
      cb('/somebasedir', [], [ 'foo.html', 'sub\\dir\\bar.html', '.git', 'abc.txt' ]);
    });
    this.engine.compile('sometemplatedir', function (err, result) {
      assert.isNull(err);
      assert.defined(result['somebasedir/foo.html']);
      assert.defined(result['somebasedir/sub/dir/bar.html']);
      done();
    });
  },
  'should ignore files with extensions other than the one specified': function (done) {
    this.stub(f, 'walkSync', function (dir, cb) {
      assert.equals(dir, 'sometemplatedir');
      cb('/somebasedir', [], [ '.git', 'abc.txt' ]);
    });
    this.engine.compile('sometemplatedir', function (err, result) {
      assert.equals(err, undefined);
      assert.equals(result, {});
      done();
    });
  }
});

buster.testCase('engine - merge', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should merge partials in page templates with non-default template': function (done) {
    var templates = {
        partials: { 'footer.html': jazz.compile('Some footer text') },
        pages: { 'page.html': jazz.compile('{include(\'footer.html\')}') },
        layouts: { 'somelayout.html': jazz.compile('{content}') }
      },
      params = {
        sitemap: {
          'page.html': {
            layout: 'somelayout.html'
          }
        }
      },
      mockMkdirp = function (dir, mode, cb) {
        assert.equals(dir, 'someoutputdir');
        assert.equals(mode, '0755');
        cb();
      },
      engine = new Engine({ mkdirp: mockMkdirp });

    this.mockConsole.expects('log').withExactArgs('+ creating %s', 'someoutputdir/page.html');
    this.stub(fs, 'writeFile', function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, 'Some footer text');
      assert.equals(encoding, 'utf8');
      cb();
    });
    engine.merge('someoutputdir', templates, params, function (err, result) {
      assert.isNull(err);
      assert.equals(result[0], 'page.html');
      done();
    });
  },
  'should merge layouts in page templates': function (done) {
    var templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content') },
        layouts: { 'default.html': jazz.compile('Some layout {content}') }
      },
      params = {},
      mockMkdirp = function (dir, mode, cb) {
        assert.equals(dir, 'someoutputdir');
        assert.equals(mode, '0755');
        cb();
      },
      engine = new Engine({ mkdirp: mockMkdirp });

    this.mockConsole.expects('log').withExactArgs('+ creating %s', 'someoutputdir/page.html');
    this.stub(fs, 'writeFile', function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, 'Some layout Some content');
      assert.equals(encoding, 'utf8');
      cb();
    });
    engine.merge('someoutputdir', templates, params, function (err, result) {
      assert.isNull(err);
      assert.equals(result[0], 'page.html');
      done();
    });
  },
  'should merge parameters in page templates and pass any error': function (done) {
    var templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      mockMkdirp = function (dir, mode, cb) {
        assert.equals(dir, 'someoutputdir');
        assert.equals(mode, '0755');
        cb();
      },
      engine = new Engine({ mkdirp: mockMkdirp });

    this.stub(fs, 'writeFile', function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, 'Some content with param bar');
      assert.equals(encoding, 'utf8');
      cb(new Error('some error'));
    });
    engine.merge('someoutputdir', templates, params, function (err, result) {
      assert.equals(err.message, 'some error');
      assert.equals(result[0], 'page.html');
      done();
    });
  },
  'should log command message when there is no error while writing the page file': function (done) {
    var templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      mockMkdirp = function (dir, mode, cb) {
        assert.equals(dir, 'some/output/dir');
        assert.equals(mode, '0755');
        cb();
      },
      engine = new Engine({ mkdirp: mockMkdirp });

    this.mockConsole.expects('log').withExactArgs('+ creating %s', 'some/output/dir/page.html');
    this.stub(fs, 'writeFile', function (page, content, encoding, cb) {
      assert.equals(page, 'some/output/dir/page.html');
      assert.equals(content, 'Some content with param bar');
      assert.equals(encoding, 'utf8');
      cb();
    });
    engine.merge('some/output/dir', templates, params, function (err, result) {
      assert.isNull(err);
      assert.equals(result[0], 'page.html');
      done();
    });
  },
  'should pass error to callback when directory cannot be created': function (done) {
    var templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      mockMkdirp = function (dir, mode, cb) {
        assert.equals(dir, 'some/output/dir');
        assert.equals(mode, '0755');
        cb(new Error('someerror'));
      },
      engine = new Engine({ mkdirp: mockMkdirp });

    engine.merge('some/output/dir', templates, params, function (err, result) {
      assert.equals(err.message, 'someerror');
      assert.equals(result[0], 'page.html');
      done();
    });
  },
  'should create dir with *nix and Windows paths': function (done) {
    var templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      mockMkdirp = function (dir, mode, cb) {
        assert.equals(dir, 'some\\output');
        assert.equals(mode, '0755');
        cb(new Error('someerror'));
      },
      engine = new Engine({ mkdirp: mockMkdirp });

    engine.merge('some\\output\\dir', templates, params, function (err, result) {
      assert.equals(err.message, 'someerror');
      assert.equals(result[0], 'page.html');
      done();
    });
  }
});
