/*
var bag = require('bagofholding'),
  jazz = require('jazz'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  engine;

describe('engine', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/engine', {
      requires: mocks ? mocks.requires : {},
      globals: {
        console: bag.mock.console(checks, mocks)
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('compile', function () {

    beforeEach(function () {
      checks.fs_readFile_files = [];
      mocks.requires = {
        fs: {
          readFile: function (baseFile, encoding, cb) {
            checks.fs_readFile_files.push(baseFile);
            encoding.should.equal('utf8');
            cb(null, 'somecontent');
          }
        },
        file: {
          walkSync: function (dir, cb) {
            checks.file_walkSync_dir = dir;
            cb('/somebasedir', null, mocks.file_walkSync_files);
          }
        }
      };
    });

    it('should compile files with the specified file extension', function (done) {
      mocks.file_walkSync_files = [ 'foo.html', 'sub/dir/bar.html', '.git', 'abc.txt' ];
      engine = new (create(checks, mocks))('html');
      engine.compile('sometemplatedir', function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.file_walkSync_dir.should.equal('sometemplatedir');
      checks.fs_readFile_files.length.should.equal(2);
      checks.fs_readFile_files[0].should.equal('/somebasedir/foo.html');
      checks.fs_readFile_files[1].should.equal('/somebasedir/sub/dir/bar.html');
      should.not.exist(checks.engine_compile_err);
      should.exist(checks.engine_compile_result);
      should.exist(checks.engine_compile_result['somebasedir/foo.html']);
      should.exist(checks.engine_compile_result['somebasedir/sub/dir/bar.html']);
    });

    it('should compile files with windows file path separator (backslashes) and have url path separator (slashes)', function (done) {
      mocks.file_walkSync_files = [ 'foo.html', 'sub\\dir\\bar.html', '.git', 'abc.txt' ];
      engine = new (create(checks, mocks))('html');
      engine.compile('sometemplatedir', function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.file_walkSync_dir.should.equal('sometemplatedir');
      checks.fs_readFile_files.length.should.equal(2);
      checks.fs_readFile_files[0].should.equal('/somebasedir/foo.html');
      checks.fs_readFile_files[1].should.equal('/somebasedir/sub\\dir\\bar.html');
      should.not.exist(checks.engine_compile_err);
      should.exist(checks.engine_compile_result);
      should.exist(checks.engine_compile_result['somebasedir/foo.html']);
      should.exist(checks.engine_compile_result['somebasedir/sub/dir/bar.html']);
    });

    it('should ignore files with extensions other than the one specified', function (done) {
      mocks.file_walkSync_files = [ '.git', 'abc.txt' ];
      engine = new (create(checks, mocks))('html');
      engine.compile('sometemplatedir', function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.file_walkSync_dir.should.equal('sometemplatedir');
      checks.fs_readFile_files.length.should.equal(0);
      should.not.exist(checks.engine_compile_err);
      should.exist(checks.engine_compile_result);
    });
  });

  describe('merge', function () {

    beforeEach(function () {
      mocks.requires = {
        fs: {
          writeFile: function (file, content, encoding, cb) {
            checks.fs_writeFile_file = file;
            checks.fs_writeFile_content = content;
            encoding.should.equal('utf8');
            cb(mocks.fs_writeFile_err);
          }
        },
        mkdirp: function (dir, mode, cb) {
          checks.mkdirp_dir = dir;
          mode.should.equal('0755');
          cb(mocks.mkdirp_err);
        }
      };
    });

    it('should merge partials in page templates', function (done) {
      var templates = {
          partials: {
            'footer.html': jazz.compile('Some footer text')
          },
          pages: {
            'page.html': jazz.compile('{include(\'footer.html\')}')
          },
          layouts: {
            'default.html': jazz.compile('{content}')
          }
        },
        params = {
        };
      engine = new (create(checks, mocks))('html');
      engine.merge('someoutputdir', templates, params, function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.fs_writeFile_content.should.equal('Some footer text');
    });

    it('should merge layouts in page templates', function (done) {
      var templates = {
          partials: {
          },
          pages: {
            'page.html': jazz.compile('Some content')
          },
          layouts: {
            'default.html': jazz.compile('Some layout {content}')
          }
        },
        params = {
        };
      engine = new (create(checks, mocks))('html');
      engine.merge('someoutputdir', templates, params, function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.fs_writeFile_content.should.equal('Some layout Some content');
    });

    it('should merge parameters in page templates', function (done) {
      var templates = {
          partials: {
          },
          pages: {
            'page.html': jazz.compile('Some content with param {foo}')
          },
          layouts: {
            'default.html': jazz.compile('{content}')
          }
        },
        params = {
          foo: 'bar'
        };
      engine = new (create(checks, mocks))('html');
      engine.merge('someoutputdir', templates, params, function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.fs_writeFile_content.should.equal('Some content with param bar');
    });

    it('should log command message when there is no error while writing the page file', function (done) {
      var templates = {
          partials: {
          },
          pages: {
            'page.html': jazz.compile('Some content with param {foo}')
          },
          layouts: {
            'default.html': jazz.compile('{content}')
          }
        },
        params = {
          foo: 'bar'
        };
      engine = new (create(checks, mocks))('html');
      engine.merge('some/output/dir', templates, params, function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('+ creating some/output/dir/page.html');
      checks.mkdirp_dir.should.equal('some/output/dir');
    });

    it('should pass error to callback when directory cannot be created', function (done) {
      mocks.mkdirp_err = new Error('someerror');
      var templates = {
          partials: {
          },
          pages: {
            'page.html': jazz.compile('Some content with param {foo}')
          },
          layouts: {
            'default.html': jazz.compile('{content}')
          }
        },
        params = {
          foo: 'bar'
        };
      engine = new (create(checks, mocks))('html');
      engine.merge('some/output/dir', templates, params, function (err, result) {
        checks.engine_compile_err = err;
        checks.engine_compile_result = result;
        done();
      });
      checks.engine_compile_err.message.should.equal('someerror');
      checks.mkdirp_dir.should.equal('some/output/dir');
    });

    it('should create dir with *nix and Windows paths', function () {
      mocks.mkdirp_err = new Error('someerror');
      var templates = {
          partials: {
          },
          pages: {
            'page.html': jazz.compile('Some content with param {foo}')
          },
          layouts: {
            'default.html': jazz.compile('{content}')
          }
        },
        params = {
          foo: 'bar'
        };
      engine = new (create(checks, mocks))('html');

      engine.merge('some/output/dir', templates, params, function (err, result) {
      });
      checks.mkdirp_dir.should.equal('some/output/dir');

      engine.merge('some\\output\\dir', templates, params, function (err, result) {
      });
      checks.mkdirp_dir.should.equal('some\\output');
    });
  });
});
*/