"use strict";
/* eslint no-unused-vars: 0 */
import bag from 'bagofcli';
import Engine from '../lib/engine.js';
import f from 'file';
import fs from 'fs';
import jazz from 'jazz';
import { mkdirp } from 'mkdirp';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
import util from 'util';
const assert = referee.assert;

describe('engine - engine', function() {

  it('should use default ext when optional ext is not specified', function () {
    const engine = new Engine({ version: '1.2.3' });
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
    this.engine = new Engine({ version: '1.2.3' });
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
    this.mockBag = sinon.mock(bag);
    this.mockMkdirp = sinon.mock(mkdirp);
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
    this.mockMkdirp.verify();
    this.mockMkdirp.restore();
  });

  it('should merge partials in page templates with non-default template', function (done) {
    const templates = {
        partials: { 'footer.html': jazz.compile('Some footer text') },
        pages: { 'page.html': jazz.compile('{include(\'footer.html\')}') },
        layouts: { 'somelayout.html': jazz.compile('<html lang="en"><head><title>Some Title</title><body>{content}</body></html>') }
      },
      params = {
        sitemap: {
          'page.html': {
            layout: 'somelayout.html'
          }
        }
      },
      engine = new Engine({ version: '1.2.3' });

    this.mockMkdirp.expects('sync').withExactArgs('someoutputdir');
    this.mockBag.expects('logStepItemSuccess').withExactArgs('creating someoutputdir/page.html');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, '<html lang="en"><head><title>Some Title</title><meta name="generator" content="AE86 1.2.3"></head><body>Some footer text</body></html>');
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
        layouts: { 'default.html': jazz.compile('<html lang="en"><head><title>Some Title</title><body>Some layout {content}</body></html>') }
      },
      params = {},
      engine = new Engine({ version: '1.2.3' });

    this.mockMkdirp.expects('sync').withExactArgs('someoutputdir');
    this.mockBag.expects('logStepItemSuccess').withExactArgs(util.format('creating someoutputdir/page.html'));
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, '<html lang="en"><head><title>Some Title</title><meta name="generator" content="AE86 1.2.3"></head><body>Some layout Some content</body></html>');
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
        layouts: { 'default.html': jazz.compile('<html lang="en"><head><title>Some Title</title></head><body>{content}</body></html>') }
      },
      params = { foo: 'bar' },
      engine = new Engine({ version: '1.2.3' });

    this.mockMkdirp.expects('sync').withExactArgs('someoutputdir');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'someoutputdir/page.html');
      assert.equals(content, '<html lang="en"><head><title>Some Title</title><meta name="generator" content="AE86 1.2.3"></head><body>Some content with param bar</body></html>');
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
        layouts: { 'default.html': jazz.compile('<html lang="en"><head><title>Some Title</title><body>{content}</body></html>') }
      },
      params = { foo: 'bar' },
      engine = new Engine({ version: '1.2.3' });

    this.mockMkdirp.expects('sync').withExactArgs('some/output/dir');
    this.mockBag.expects('logStepItemSuccess').withExactArgs('creating some/output/dir/page.html');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'some/output/dir/page.html');
      assert.equals(content, '<html lang="en"><head><title>Some Title</title><meta name="generator" content="AE86 1.2.3"></head><body>Some content with param bar</body></html>');
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
        layouts: { 'default.html': jazz.compile('<html lang="en"><head><title>Some Title</title><body>{content}</body></html>') }
      },
      params = { foo: 'bar' },
      engine = new Engine({ version: '1.2.3' });

    this.mockMkdirp.expects('sync').withExactArgs('some/output/dir');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'some/output/dir/page.html');
      assert.equals(content, '<html lang="en"><head><title>Some Title</title><meta name="generator" content="AE86 1.2.3"></head><body>Some content with param bar</body></html>');
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
        layouts: { 'default.html': jazz.compile('<html lang="en"><head><title>Some Title</title></head><body>{content}</body></html>') }
      },
      params = { foo: 'bar' },
      engine = new Engine({ version: '1.2.3' });

    this.mockMkdirp.expects('sync').withExactArgs('some\\output');
    this.mockBag.expects('logStepItemSuccess').withExactArgs('creating some\\output\\dir/page.html');
    sinon.stub(fs, 'writeFile').value(function (page, content, encoding, cb) {
      assert.equals(page, 'some\\output\\dir/page.html');
      assert.equals(content, '<html lang="en"><head><title>Some Title</title><meta name="generator" content="AE86 1.2.3"></head><body>Some content with param bar</body></html>');
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
