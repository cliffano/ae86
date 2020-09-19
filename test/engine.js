"use strict"
/* eslint no-unused-vars: 0 */
import Engine from '../lib/engine.js';
import f from 'file';
import fs from 'fs';
import jazz from 'jazz';
import mkdirp from 'mkdirp';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
const assert = referee.assert;

describe('engine - engine', function() {

  it('should use default ext when optional ext is not specified', function () {
    const engine = new Engine();
    assert.equals(engine.ext, 'html');
  });

  it('should use specified ext', function () {
    const engine = new Engine({ ext: 'someext' });
    assert.equals(engine.ext, 'someext');
  });
});

describe('engine - compile', function() {

  beforeEach(function () {
    this.mockFs = sinon.mock(fs);
    this.engine = new Engine();
  });

  afterEach(function () {
    this.mockFs.verify();
    this.mockFs.restore();
  });

  it('should compile files with the specified file extension', function (done) {
    this.mockFs.expects('readFile').withArgs('/somebasedir/foo.html', 'utf8').callsArgWith(2, null, 'foo');
    this.mockFs.expects('readFile').withArgs('/somebasedir/sub/dir/bar.html', 'utf8').callsArgWith(2, null, 'bar');
    sinon.stub(f, 'walkSync').value(function (dir, cb) {
      assert.equals(dir, 'sometemplatedir');
      cb('/somebasedir', [], [ 'foo.html', 'sub/dir/bar.html', '.git', 'abc.txt' ]);
    });
    this.engine.compile('sometemplatedir', function (err, result) {
      assert.equals(err, null);
      assert.isObject(result['somebasedir/foo.html']);
      assert.isObject(result['somebasedir/sub/dir/bar.html']);
      done();
    });
  });

  it('should compile files with windows file path separator (backslashes) and have url path separator (slashes)', function (done) {
    this.mockFs.expects('readFile').withArgs('/somebasedir/foo.html', 'utf8').callsArgWith(2, null, 'foo');
    this.mockFs.expects('readFile').withArgs('/somebasedir/sub\\dir\\bar.html', 'utf8').callsArgWith(2, null, 'bar');
    sinon.stub(f, 'walkSync').value(function (dir, cb) {
      assert.equals(dir, 'sometemplatedir');
      cb('/somebasedir', [], [ 'foo.html', 'sub\\dir\\bar.html', '.git', 'abc.txt' ]);
    });
    this.engine.compile('sometemplatedir', function (err, result) {
      assert.equals(err, null);
      assert.isObject(result['somebasedir/foo.html']);
      assert.isObject(result['somebasedir/sub/dir/bar.html']);
      done();
    });
  });

  it('should ignore files with extensions other than the one specified', function (done) {
    sinon.stub(f, 'walkSync').value(function (dir, cb) {
      assert.equals(dir, 'sometemplatedir');
      cb('/somebasedir', [], [ '.git', 'abc.txt' ]);
    });
    this.engine.compile('sometemplatedir', function (err, result) {
      assert.equals(err, null);
      assert.equals(result, {});
      done();
    });
  });
});

describe('engine - merge', function() {

  beforeEach(function () {
    this.mockConsole = sinon.mock(console);
    this.mockMkdirp = sinon.mock(mkdirp);
  });

  afterEach(function () {
    this.mockConsole.verify();
    this.mockConsole.restore();
    this.mockMkdirp.verify();
    this.mockMkdirp.restore();
  });

  it('should merge partials in page templates with non-default template', function (done) {
    const templates = {
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
      engine = new Engine();

    this.mockMkdirp.expects('sync').withExactArgs('someoutputdir');
    this.mockConsole.expects('log').withExactArgs('+ creating %s', 'someoutputdir/page.html');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, 'Some footer text');
      assert.equals(encoding, 'utf8');
      cb();
    });
    engine.merge('someoutputdir', templates, params, function (err, result) {
      assert.equals(err, null);
      assert.equals(result[0], 'page.html');
      done();
    });
  });

  it('should merge layouts in page templates', function (done) {
    const templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content') },
        layouts: { 'default.html': jazz.compile('Some layout {content}') }
      },
      params = {},
      engine = new Engine();

    this.mockMkdirp.expects('sync').withExactArgs('someoutputdir');
    this.mockConsole.expects('log').withExactArgs('+ creating %s', 'someoutputdir/page.html');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, 'Some layout Some content');
      assert.equals(encoding, 'utf8');
      cb();
    });
    engine.merge('someoutputdir', templates, params, function (err, result) {
      assert.equals(err, null);
      assert.equals(result[0], 'page.html');
      done();
    });
  });

  it('should merge parameters in page templates and pass any error', function (done) {
    const templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      engine = new Engine();

    this.mockMkdirp.expects('sync').withExactArgs('someoutputdir');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
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
  });

  it('should log command message when there is no error while writing the page file', function (done) {
    const templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      engine = new Engine();

    this.mockMkdirp.expects('sync').withExactArgs('some/output/dir');
    this.mockConsole.expects('log').withExactArgs('+ creating %s', 'some/output/dir/page.html');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'some/output/dir/page.html');
      assert.equals(content, 'Some content with param bar');
      assert.equals(encoding, 'utf8');
      cb();
    });
    engine.merge('some/output/dir', templates, params, function (err, result) {
      assert.equals(err, null);
      assert.equals(result[0], 'page.html');
      done();
    });
  });

  it('should pass error to callback when directory cannot be created', function (done) {
    const templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      engine = new Engine();

    this.mockMkdirp.expects('sync').withExactArgs('some/output/dir');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'some/output/dir/page.html');
      assert.equals(content, 'Some content with param bar');
      assert.equals(encoding, 'utf8');
      cb(new Error('Directory cannot be created'));
    });
    engine.merge('some/output/dir', templates, params, function (err, result) {
      assert.equals(err.message, 'Directory cannot be created');
      assert.equals(result[0], 'page.html');
      done();
    });
  });

  it('should create dir with *nix and Windows paths', function (done) {
    const templates = {
        partials: {},
        pages: { 'page.html': jazz.compile('Some content with param {foo}') },
        layouts: { 'default.html': jazz.compile('{content}') }
      },
      params = { foo: 'bar' },
      engine = new Engine();

    this.mockMkdirp.expects('sync').withExactArgs('some\\output');
    this.mockConsole.expects('log').withExactArgs('+ creating %s', 'some\\output\\dir/page.html');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'some\\output\\dir/page.html');
      assert.equals(content, 'Some content with param bar');
      assert.equals(encoding, 'utf8');
      cb();
    });
    engine.merge('some\\output\\dir', templates, params, function (err, result) {
      assert.equals(err, null);
      assert.equals(result[0], 'page.html');
      done();
    });
  });
});
