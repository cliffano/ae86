# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- Switch release workflow to use release-action
- Upgrade all workflows versions
- Update ESLint config to eslint.config.js

### Removed
- Remove CodeQL analysis GH workflow

## 3.0.0 - 2024-05-22

### Changed
- Upgrade deps to latest, mkdirp to 3.x
- Set min node engine to >= 18.0.0
- Add NODE_NO_WARNINGS=1 to integration test runs which require output matching

## 2.4.1 - 2023-07-30
### Changed
- Replace console logging of page generation with bagofcli

## 2.4.0 - 2023-07-29
### Changed
- Set min node engine to >= 16.0.0
- Replace console logging with bagofcli

## 2.3.1 - 2022-01-18
### Fixed
- Fix Publish workflow ref to use formatted tag

## 2.3.0 - 2022-01-18
### Changed
- Change Engine unit tests to use HTML-formatted layout

## 2.2.1 - 2022-01-13
### Fixed
- Fix release to use version ref

## 2.2.0 - 2021-04-15
### Changed
- Replace vulnerable deps

## 2.1.0 - 2020-11-02
### Changed
- Upgrade deps to latest
- Increase test coverage to 100%

## 2.0.0 - 2020-09-26
### Changed
- Set min node engine to >= 13.0.0
- Subcommand options position must be after the command
- Replace lint type from jshint to eslint
- Replace coverage from buster-istanbul to c8
- Replace doc type from dox-foundation to jsdoc
- Replace Travis CI with GH Actions

### Removed
- Remove JavaScript and CSS minification

## 1.0.2 - 2016-08-23
### Added
- Add generator meta tag to all pages

## 1.0.1 - 2016-08-07
### Changed
- Set min node engine to >= 4.0.0

## 1.0.0 - 2016-02-03
### Changed
- First stable release

## 0.1.3 - 2015-08-14

## 0.1.2 - 2015-08-13
### Added
- Add JavaScript and CSS minification

## 0.1.1 - 2015-06-21
### Added
- Add build reports to readme

## 0.1.0 - 2014-09-08
### Changed
- Update example site with Bootstrap and Google Fonts
- Set min node engine to >= v0.10.0

## 0.0.10 - 2013-12-08
### Added
- Add outDir flag to gen and watch/drift commands

## 0.0.9 - 2013-10-31
### Changed
- Change test lib to buster-node + referee
- Set min node engine to >= v0.8.0

## 0.0.8 - 2013-06-30
### Changed
- Update dependencies

## 0.0.7 - 2013-02-17
### Changed
- Engine template file extension is now optional, defaults to html
- Modify gen ID format, no longer includes millisecs value

## 0.0.6 - 2012-08-15

## 0.0.5 - 2012-07-27
### Added
- Add clean target to remove the generated website

## 0.0.4 - 2012-02-22
### Changed
- Display usage on arg-less comamand
- Upgrade jazz to v0.0.18, file to v0.2.0
- Replace watch-tree module with watch-tree-maintained for node v0.6.x compatibility

## 0.0.3 - 2012-01-07

## 0.0.2 - 2011-12-11
### Added
- Add watch mode

### Changed
- Refactor lib modules

## 0.0.1 - 2011-11-27
### Added
- Initial version
