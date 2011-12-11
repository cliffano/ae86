AE86 ![http://travis-ci.org/cliffano/ae86](https://secure.travis-ci.org/cliffano/ae86.png?branch=master)
----

AE86 is a static website generator written in Node.js .

Installation
------------

    npm install -g ae86

Usage
-----

Create new project with sample templates:

    ae86 init

* partials/ - directory containing partial templates
* layouts/ - directory containing layout templates
* pages/ - directory containing page templates
* params.js - file containing custom tags and variables

Generate the website, website will be written to out/ directory:

    ae86 gen

Watch the project, website will automatically be regenerated everytime there's a modified file:

    ae86 watch

Template & Parameters
---------------------

AE86 uses [shinetech/jazz](https://github.com/shinetech/jazz) as its template engine, checkout Jazz for further syntax documentation.

__Partials__

Partial templates can be used for fragments of the website, e.g. website header, footer, and navigation, that appear on multiple pages. Partial templates can be included in other templates using the include tag.

__Layouts__

Layout templates are applied to each page. By default, all pages use layouts/default.html unless otherwise specified in params.js' sitemap. Page content is rendered in layout using {content} param.

__Pages__

Each page template will be applied a layout and evaluated into a static HTML page.

__Static__

Place all static files (e.g. images, scripts, styles, robots.txt) in static directory. The directory structure of static files will be kept as-is. If there's any conflict with the page templates, the page template will overwrite the static file.

__Parameters__

Website parameters can be specified in exports.params object in params.js file:

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

__Custom Tags__

Custom tag can be specified in params.js as a function:

    exports.params = {
      copyright: function (year, name, cb) {
        cb('Copyright &copy; ' + year + ' ' + name + '. Some Rights Reserved.');
      }
    }

Note that a custom tag function must have a callback(result) as the last argument, result will then be rendered on the template.

The custom tag can then be used in a template file:

    <div id="footer">
      {copyright('2011', 'Toyota Motor Corporation')}
    <div>

__Built-in Tags & Variables__

AE86 comes with a number of built-in tags and variables:

* include(file)
* title()
* date(format)
* relative(path)
* __genid

__include(file)__

This tag includes a partial template in another template. The file argument is relative to partials directory. E.g. include('header.html') includes partials/header.html file.

    <div id="header">
      {include('header.html')}
    </div>

A partial template can also be included in another partial template.

__title()__

This tag displays the current page's title as configured in sitemap param in params.js .

    <title>{title()}</title>

__date(format)__

This tag displays the current time with a specified format. Check out [felixge/node-dateformat](https://github.com/felixge/node-dateformat) README page for date format examples.

    <div class="date">{date('dddd dd/mm/yyyy hh:MM:ssTT')}</div>

__relative(path)__

This tag renders a path relative to the location of the page template.

    <script type="text/javascript" src="{relative('scripts/global.js')}"></script>

Which will be rendered as ../scripts/global.js from templates under subdirectories of pages directory, but it will be rendered as scripts/global.js from templates right under the pages directory.

____genid__

This variable is an ID unique for each website generation (currently a timestamp). It's handy when you want to force the client browser to request a resource that should only be cached once for each version of the website, e.g. JavaScript, CSS, or image files.

    <script type="text/javascript" src="{relative('scripts/global.js')}?{__genid}"></script>

Colophon
--------

Follow [@cliffano](http://twitter.com/cliffano) on Twitter.