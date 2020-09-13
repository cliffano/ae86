// import Engine from '../lib/engine.js';
// import f from 'file';
// import fs from 'fs';
// import jazz from 'jazz';
// import referee from '@sinonjs/referee';
// import sinon from 'sinon';
// const assert = referee.assert;

// describe('engine - engine', function() {

//   beforeEach(function () {
//     sinon.mock({});
//   });

//   it('should use default ext when optional ext is not specified', function () {
//     const engine = new Engine();
//     assert.equals(engine.ext, 'html');
//   });

//   it('should use specified ext', function () {
//     const engine = new Engine({ ext: 'someext' });
//     assert.equals(engine.ext, 'someext');
//   });
// });

// describe('engine - compile', function() {

//   beforeEach(function () {
//     this.mockFs = sinon.mock(fs);
//     this.engine = new Engine();
//   });

//   it('should compile files with the specified file extension', function (done) {
//     this.mockFs.expects('readFile').withArgs('/somebasedir/foo.html', 'utf8').callsArgWith(2, null, 'foo');
//     this.mockFs.expects('readFile').withArgs('/somebasedir/sub/dir/bar.html', 'utf8').callsArgWith(2, null, 'bar');
//     sinon.stub(f, 'walkSync', function (dir, cb) {
//       assert.equals(dir, 'sometemplatedir');
//       cb('/somebasedir', [], [ 'foo.html', 'sub/dir/bar.html', '.git', 'abc.txt' ]);
//     });
//     this.engine.compile('sometemplatedir', function (err, result) {
//       assert.equals(err, null);
//       assert.defined(result['somebasedir/foo.html']);
//       assert.defined(result['somebasedir/sub/dir/bar.html']);
//       done();
//     });
//   });

//   it('should compile files with windows file path separator (backslashes) and have url path separator (slashes)', function (done) {
//     this.mockFs.expects('readFile').withArgs('/somebasedir/foo.html', 'utf8').callsArgWith(2, null, 'foo');
//     this.mockFs.expects('readFile').withArgs('/somebasedir/sub\\dir\\bar.html', 'utf8').callsArgWith(2, null, 'bar');
//     sinon.stub(f, 'walkSync', function (dir, cb) {
//       assert.equals(dir, 'sometemplatedir');
//       cb('/somebasedir', [], [ 'foo.html', 'sub\\dir\\bar.html', '.git', 'abc.txt' ]);
//     });
//     this.engine.compile('sometemplatedir', function (err, result) {
//       assert.equals(err, null);
//       assert.defined(result['somebasedir/foo.html']);
//       assert.defined(result['somebasedir/sub/dir/bar.html']);
//       done();
//     });
//   });

//   it('should ignore files with extensions other than the one specified', function (done) {
//     sinon.stub(f, 'walkSync', function (dir, cb) {
//       assert.equals(dir, 'sometemplatedir');
//       cb('/somebasedir', [], [ '.git', 'abc.txt' ]);
//     });
//     this.engine.compile('sometemplatedir', function (err, result) {
//       assert.equals(err, null);
//       assert.equals(result, {});
//       done();
//     });
//   });
// });

// describe('engine - merge', function() {

//   beforeEach(function () {
//     this.mockConsole = sinon.mock(console);
//   });

//   it('should merge partials in page templates with non-default template', function (done) {
//     const templates = {
//         partials: { 'footer.html': jazz.compile('Some footer text') },
//         pages: { 'page.html': jazz.compile('{include(\'footer.html\')}') },
//         layouts: { 'somelayout.html': jazz.compile('{content}') }
//       },
//       params = {
//         sitemap: {
//           'page.html': {
//             layout: 'somelayout.html'
//           }
//         }
//       },
//       mockMkdirp = function (dir, mode, cb) {
//         assert.equals(dir, 'someoutputdir');
//         assert.equals(mode, '0755');
//         cb();
//       },
//       engine = new Engine({ mkdirp: mockMkdirp });

//     this.mockConsole.expects('log').withExactArgs('+ creating %s', 'someoutputdir/page.html');
//     sinon.stub(fs, 'writeFile', function (page, content, encoding, cb) {
//       assert.equals(page, 'someoutputdir/page.html');
//       assert.equals(content, 'Some footer text');
//       assert.equals(encoding, 'utf8');
//       cb();
//     });
//     engine.merge('someoutputdir', templates, params, function (err, result) {
//       assert.equals(err, null);
//       assert.equals(result[0], 'page.html');
//       done();
//     });
//   });

//   it('should merge layouts in page templates', function (done) {
//     const templates = {
//         partials: {},
//         pages: { 'page.html': jazz.compile('Some content') },
//         layouts: { 'default.html': jazz.compile('Some layout {content}') }
//       },
//       params = {},
//       mockMkdirp = function (dir, mode, cb) {
//         assert.equals(dir, 'someoutputdir');
//         assert.equals(mode, '0755');
//         cb();
//       },
//       engine = new Engine({ mkdirp: mockMkdirp });

//     this.mockConsole.expects('log').withExactArgs('+ creating %s', 'someoutputdir/page.html');
//     sinon.stub(fs, 'writeFile', function (page, content, encoding, cb) {
//       assert.equals(page, 'someoutputdir/page.html');
//       assert.equals(content, 'Some layout Some content');
//       assert.equals(encoding, 'utf8');
//       cb();
//     });
//     engine.merge('someoutputdir', templates, params, function (err, result) {
//       assert.equals(err, null);
//       assert.equals(result[0], 'page.html');
//       done();
//     });
//   });

//   it('should merge parameters in page templates and pass any error', function (done) {
//     const templates = {
//         partials: {},
//         pages: { 'page.html': jazz.compile('Some content with param {foo}') },
//         layouts: { 'default.html': jazz.compile('{content}') }
//       },
//       params = { foo: 'bar' },
//       mockMkdirp = function (dir, mode, cb) {
//         assert.equals(dir, 'someoutputdir');
//         assert.equals(mode, '0755');
//         cb();
//       },
//       engine = new Engine({ mkdirp: mockMkdirp });

//     sinon.stub(fs, 'writeFile', function (page, content, encoding, cb) {
//       assert.equals(page, 'someoutputdir/page.html');
//       assert.equals(content, 'Some content with param bar');
//       assert.equals(encoding, 'utf8');
//       cb(new Error('some error'));
//     });
//     engine.merge('someoutputdir', templates, params, function (err, result) {
//       assert.equals(err.message, 'some error');
//       assert.equals(result[0], 'page.html');
//       done();
//     });
//   });

//   it('should log command message when there is no error while writing the page file', function (done) {
//     const templates = {
//         partials: {},
//         pages: { 'page.html': jazz.compile('Some content with param {foo}') },
//         layouts: { 'default.html': jazz.compile('{content}') }
//       },
//       params = { foo: 'bar' },
//       mockMkdirp = function (dir, mode, cb) {
//         assert.equals(dir, 'some/output/dir');
//         assert.equals(mode, '0755');
//         cb();
//       },
//       engine = new Engine({ mkdirp: mockMkdirp });

//     this.mockConsole.expects('log').withExactArgs('+ creating %s', 'some/output/dir/page.html');
//     sinon.stub(fs, 'writeFile', function (page, content, encoding, cb) {
//       assert.equals(page, 'some/output/dir/page.html');
//       assert.equals(content, 'Some content with param bar');
//       assert.equals(encoding, 'utf8');
//       cb();
//     });
//     engine.merge('some/output/dir', templates, params, function (err, result) {
//       assert.equals(err, null);
//       assert.equals(result[0], 'page.html');
//       done();
//     });
//   });

//   it('should pass error to callback when directory cannot be created', function (done) {
//     const templates = {
//         partials: {},
//         pages: { 'page.html': jazz.compile('Some content with param {foo}') },
//         layouts: { 'default.html': jazz.compile('{content}') }
//       },
//       params = { foo: 'bar' },
//       mockMkdirp = function (dir, mode, cb) {
//         assert.equals(dir, 'some/output/dir');
//         assert.equals(mode, '0755');
//         cb(new Error('someerror'));
//       },
//       engine = new Engine({ mkdirp: mockMkdirp });

//     engine.merge('some/output/dir', templates, params, function (err, result) {
//       assert.equals(err.message, 'someerror');
//       assert.equals(result[0], 'page.html');
//       done();
//     });
//   });

//   it('should create dir with *nix and Windows paths', function (done) {
//     const templates = {
//         partials: {},
//         pages: { 'page.html': jazz.compile('Some content with param {foo}') },
//         layouts: { 'default.html': jazz.compile('{content}') }
//       },
//       params = { foo: 'bar' },
//       mockMkdirp = function (dir, mode, cb) {
//         assert.equals(dir, 'some\\output');
//         assert.equals(mode, '0755');
//         cb(new Error('someerror'));
//       },
//       engine = new Engine({ mkdirp: mockMkdirp });

//     engine.merge('some\\output\\dir', templates, params, function (err, result) {
//       assert.equals(err.message, 'someerror');
//       assert.equals(result[0], 'page.html');
//       done();
//     });
//   });
// });
