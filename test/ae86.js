var bag = require('bagofholding'),
  _jscov = require('../lib/ae86'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  ae86;

describe('ae86', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/ae86', {
      requires: mocks ? mocks.requires : {},
      globals: {
        console: bag.mock.console(checks, mocks),
        process: bag.mock.process(checks, mocks)
      },
      locals: {
        __dirname: '/somepath/ae86/lib'
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('init', function () {

    it('should delegate to ncp ncp when initialising the project', function (done) {
      mocks.requires = {
        ncp: {
          ncp: function (srcDir, destDir, cb) {
            checks.ncp_ncp_srcDir = srcDir;
            checks.ncp_ncp_destDir = destDir;
            cb();
          }
        }
      };
      ae86 = new (create(checks, mocks))();
      ae86.init(function (err, result) {
        done();
      });
      checks.ncp_ncp_srcDir.should.equal('/somepath/ae86/examples');
      checks.ncp_ncp_destDir.should.equal('.');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('Creating example AE86 project');
    });
  });

  describe('generate', function () {

    beforeEach(function () {

    });

    it('should set default params', function () {
    });

    it('should copy static files', function () {
    });

    it('should compile page templates', function () {
    });
  });

  describe('watch', function () {

    beforeEach(function () {

      checks.ae86_generate__count = 0;
      checks.ae86_clean__count = 0;
      checks.watchtree_watchTree_args = {};

      mocks.process_cwd = '/somepath';
      mocks.requires = {
        'watch-tree-maintained': {
          watchTree: function (file, opts) {
            checks.watchtree_watchTree_args[file] = opts;
            return bag.mock.stream(checks, mocks);
          }
        }
      };

      require.cache['/somepath/params.js'] = { foo: 'bar' };

      ae86 = new (create(checks, mocks))();
    });

    it('should log activity message', function () {
      ae86.watch();

      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('Watching for changes and automatically regenerating website');
    });

    it('should ignore swap files and set sample rate on project directories and files', function () {
      ae86.watch();

      checks.watchtree_watchTree_args['static'].ignore.should.equal('\\.swp');
      checks.watchtree_watchTree_args['static']['sample-rate'].should.equal(5);

      checks.watchtree_watchTree_args['partials'].ignore.should.equal('\\.swp');
      checks.watchtree_watchTree_args['partials']['sample-rate'].should.equal(5);

      checks.watchtree_watchTree_args['layouts'].ignore.should.equal('\\.swp');
      checks.watchtree_watchTree_args['layouts']['sample-rate'].should.equal(5);

      checks.watchtree_watchTree_args['pages'].ignore.should.equal('\\.swp');
      checks.watchtree_watchTree_args['pages']['sample-rate'].should.equal(5);

      checks.watchtree_watchTree_args['params.js'].ignore.should.equal('\\.swp');
      checks.watchtree_watchTree_args['params.js']['sample-rate'].should.equal(5);
    });

    it('should log message and set listener when a file is created', function () {

      mocks.stream_on_fileCreated = ['somepath', 'somestats'];

      ae86 = new (create(checks, mocks))();
      ae86.generate = function () {
        checks.ae86_generate__count++;
      };

      should.exist(require.cache['/somepath/params.js']);

      ae86.watch();

      should.not.exist(require.cache['/somepath/params.js']);

      checks.ae86_generate__count.should.equal(5);

      checks.console_log_messages.length.should.equal(6);
      checks.console_log_messages[0].should.equal('Watching for changes and automatically regenerating website');
      checks.console_log_messages[1].should.equal('static was created');
      checks.console_log_messages[2].should.equal('partials was created');
      checks.console_log_messages[3].should.equal('layouts was created');
      checks.console_log_messages[4].should.equal('pages was created');
      checks.console_log_messages[5].should.equal('params.js was created');      
    });

    it('should log message and set listener when a file is modified', function () {

      mocks.stream_on_fileModified = ['somepath', 'somestats'];

      ae86 = new (create(checks, mocks))();
      ae86.generate = function () {
        checks.ae86_generate__count++;
      };

      should.exist(require.cache['/somepath/params.js']);

      ae86.watch();

      should.not.exist(require.cache['/somepath/params.js']);

      checks.ae86_generate__count.should.equal(5);

      checks.console_log_messages.length.should.equal(6);
      checks.console_log_messages[0].should.equal('Watching for changes and automatically regenerating website');
      checks.console_log_messages[1].should.equal('static was modified');
      checks.console_log_messages[2].should.equal('partials was modified');
      checks.console_log_messages[3].should.equal('layouts was modified');
      checks.console_log_messages[4].should.equal('pages was modified');
      checks.console_log_messages[5].should.equal('params.js was modified');      
    });

    it('should log message, call clean, and set listener when a file is deleted', function () {
    
      mocks.stream_on_fileDeleted = ['somepath', 'somestats'];

      ae86 = new (create(checks, mocks))();
      ae86.generate = function () {
        checks.ae86_generate__count++;
      };
      ae86.clean = function () {
        checks.ae86_clean__count++;
      };

      should.exist(require.cache['/somepath/params.js']);
      
      ae86.watch();

      should.not.exist(require.cache['/somepath/params.js']);

      checks.ae86_generate__count.should.equal(5);
      checks.ae86_clean__count.should.equal(5);

      checks.console_log_messages.length.should.equal(6);
      checks.console_log_messages[0].should.equal('Watching for changes and automatically regenerating website');
      checks.console_log_messages[1].should.equal('static was deleted');
      checks.console_log_messages[2].should.equal('partials was deleted');
      checks.console_log_messages[3].should.equal('layouts was deleted');
      checks.console_log_messages[4].should.equal('pages was deleted');
      checks.console_log_messages[5].should.equal('params.js was deleted');  
    });

  });

  describe('clean', function () {

    it('should delegate to wrench rmdirRecursive when removing the generated website', function (done) {
      mocks.requires = {
        wrench: {
          rmdirRecursive: function (dir, cb) {
            checks.wrench_rmdirRecursive_dir = dir;
            cb();
          }
        }
      };
      ae86 = new (create(checks, mocks))();
      ae86.clean(function (err, result) {
        done();
      });
      checks.wrench_rmdirRecursive_dir.should.equal('out');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('Removing website');
    });
  });
});