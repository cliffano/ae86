var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  engine;

describe('engine', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/engine', {
      requires: mocks ? mocks.requires : {},
      globals: {}
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('compile', function () {

    it('should compile files with the specified file extension', function () {
    });

    it('should ignore files with extensions other than the one specified', function () {
    });
  });

  describe('merge', function () {

    it('should merge partials in page templates', function () {
    });

    it('should merge layouts in page templates', function () {
    });

    it('should merge parameters in page templates', function () {
    });

    it('should log command message when there is no error while writing the page file', function () {
    });
  });
});
 