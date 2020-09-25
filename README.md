<img align="right" src="https://raw.github.com/cliffano/ae86/master/avatar.jpg" alt="Avatar"/>

[![Build Status](https://github.com/cliffano/ae86/workflows/CI/badge.svg)](https://github.com/cliffano/ae86/actions?query=workflow%3ACI)
[![Vulnerabilities Status](https://snyk.io/test/github/cliffano/ae86/badge.svg)](https://snyk.io/test/github/cliffano/ae86)
[![Dependencies Status](https://img.shields.io/david/cliffano/ae86.svg)](http://david-dm.org/cliffano/ae86)
[![Coverage Status](https://img.shields.io/coveralls/cliffano/ae86.svg)](https://coveralls.io/r/cliffano/ae86?branch=master)
[![Published Version](https://img.shields.io/npm/v/ae86.svg)](http://www.npmjs.com/package/ae86)
<br/>
[![npm Badge](https://nodei.co/npm/ae86.png)](http://npmjs.org/package/ae86)

AE86
----

AE86 is an old school static website generator written in Node.js .

This is handy when you want to create a static website by specifying simple templates, along with custom variables and template functions.
All you need to know is standard HTML, JavaScript, CSS, and a bit of simple Jazz templating, nothing fancy.

Installation
------------

    npm install -g ae86

Usage
-----

Create example AE86 project:

    ae86 init

An AE86 project has the following structure:

* partials/ - directory containing partial templates
* layouts/ - directory containing layout templates
* pages/ - directory containing page templates
* params.js - file containing custom variables and template functions

Generate website (written to out/ directory):

    ae86 gen

Watch for changes and automatically regenerate website:

    ae86 watch

Or, for AE86 historians, use this alias for watch:

    ae86 drift

Remove website:

    ae86 clean

To use custom directory for the generated website:

    ae86 gen --out-dir public
    ae86 watch --out-dir public
    ae86 clean --out-dir public

Template & Parameters
---------------------

AE86 uses [shinetech/jazz](https://github.com/shinetech/jazz) as its template engine, checkout Jazz documentation for further syntax documentation.

__Partials__

Partial templates can be used for fragments of the website, e.g. website header, footer, and navigation, which appear on multiple pages. Partial templates can be included in other templates using {include('partial.html')} template function.

__Layouts__

Layout templates are applied to each page. By default, all pages use layouts/default.html unless otherwise specified in params.js' sitemap. Page content is rendered in layout using {content} variable.

__Pages__

Each page template will be applied a layout, and evaluated into a static HTML page.

__Static__

Place all static files (e.g. images, scripts, styles, robots.txt) in static directory. The directory structure of static files will be kept as-is. If there's any conflict with the page templates, the page template will overwrite the static file.

__Custom Variables__

Website custom variables and template functions can be specified in exports.params object in params.js file:

    exports.params = {
      subtitle: 'Small, lightweight, since 1983.',
      team: ['Keiichi Tsuchiya', 'Mitsu Ide', 'Dori-Kin']
    }

These parameters can then be used in a template file:

    <h2>{subtitle}</h2>
    <ul>
    {foreach person in team}
      <li>{person}</li>
    {end}
    </ul>

You also need to specify the sitemap in params.js file. The key should match the page file names under the pages directory, title and layout can optionally be specified as the value. Layout value must be relative to layouts directory, e.g. layout: brochure.html uses layouts/brochure.html . If layout is not specified, then layouts/default.html will be used.

    exports.params = {
      sitemap: {
        'index.html': { title: 'Home Page' },
        'products/corolla.html': { title: 'Toyota Corolla', layout: 'brochure.html' },
        'products/sprinter.html': { title: 'Toyota Sprinter', layout: 'brochure.html' },
        'contact.html': { title: 'Contact Us' }
      }
    }

Note that params.js is a Node.js module, so it can require other modules accordingly.

__Custom Template Functions__

Custom template functions can be specified in params.js :

    exports.params = {
      copyright: function (year, name, cb) {
        cb('Copyright &copy; ' + year + ' ' + name + '. Some Rights Reserved.');
      }
    }

Note that a custom template function must have a callback(result) as the last argument, result will then be rendered on the template.

The custom copyright template function above can then be used in a template file:

    <div id="footer">
      {copyright('2011', 'Toyota Motor Corporation')}
    <div>

__Built-in Variables & Template Functions__

AE86 comes with a number of built-in variables and template functions:

* include(file)
* title()
* date(format)
* relative(path)
* __genId

__include(file)__

This template function includes a partial template within another template. The file argument is relative to partials directory. E.g. include('header.html') includes partials/header.html file.

    <div id="header">
      {include('header.html')}
    </div>

A partial template can also be included in another partial template.

__title()__

This template function displays the current page's title as configured in sitemap param in params.js file.

    <title>{title()}</title>

__date(format)__

This template function displays the current time with a specified format. Check out [felixge/node-dateformat](https://github.com/felixge/node-dateformat) README page for date format examples.

    <div class="date">{date('dddd dd/mm/yyyy hh:MM:ssTT')}</div>

__relative(path)__

This template function renders a path relative to the location of the page template.

    <script type="text/javascript" src="{relative('scripts/global.js')}"></script>

Which will be rendered as ../scripts/global.js from templates under the subdirectories of pages directory, but it will be rendered as scripts/global.js from templates right under the pages directory.

Note that each JavaScript and CSS file has a corresponding minified version, i.e. a somescript.js has a corresponding somescript.min.js, somestyle.css has somestyle.min.css .

<strong>__genId</strong>

This variable is an ID unique for each website generation (currently a timestamp). It's handy when you want to force the client browser to request a resource that should only be cached once for each version of the generated website, e.g. JavaScript, CSS, or image files.

    <script type="text/javascript" src="{relative('scripts/global.js')}?{__genId}"></script>

Upgrade
-------

From 1.x.x to 2.x.x .

Update params.js to use `export` to make the params available:

    const params = {
      site: {
        name: "AE86",
        url: "https://github.com/cliffano/ae86"
      }
    }
    export {
      params as params
    }

Bob Integration
---------------

AE86 support is included in [Bob](http://github.com/cliffano/bob) build tool.

Configure AE86 in `.bob.json` file:

    {
      "site": {
        "type": "ae86"
      }
    }

And generate the web site with `bob site` command.

Colophon
--------

[Developer's Guide](http://cliffano.github.io/developers_guide.html#nodejs)

Build reports:

* [Code complexity report](http://cliffano.github.io/ae86/complexity/plato/index.html)
* [Unit tests report](http://cliffano.github.io/ae86/test/mocha.txt)
* [Test coverage report](http://cliffano.github.io/ae86/coverage/c8/index.html)
* [Integration tests report](http://cliffano.github.io/ae86/test-integration/cmdt.txt)
* [API Documentation](http://cliffano.github.io/ae86/doc/jsdoc/index.html)
