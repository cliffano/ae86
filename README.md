AE86 ![http://travis-ci.org/cliffano/ae86](https://secure.travis-ci.org/cliffano/ae86.png?branch=master)
----

Static website generator.

Installation
------------

    npm install -g ae86

Usage
-----

Create new project structure:

    ae86 init

* partials/ - directory containing partial template files
* layouts/ - directory containing layout template files
* pages/ - directory containing website page files
* params.js - file containing website custom tags and variables

Create the templates (check out the Template section further below).

Generate the website:

    ae86 gen

Template
--------

__Partials__

Partials are fragments of the template which can be included in other templates using the include tag.

__Layouts__

Layouts are applied to the pages, by default each page uses *drum roll* layouts/default.html unless otherwise specified in params.js' sitemap. Page content is rendered in layout using {body} param.

    {body}

__Pages__

Each page template will be applied a layout and processed into static HTML page.

__Static__

Place all static files (e.g. images, scripts, styles, robots.txt) in static directory. The directory structure of static files will be kept as-is.

__Parameters__

Website parameters can be specified in an object in params.js file:

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

You also need to specify the sitemap in params.js file. The key should match the page file names under the pages directory, title and layout can be specified as the value. Layout value must be relative to layouts directory, e.g. layout: brochure.html uses layouts/brochure.html . If layout is not specified, then layouts/default.html will be used.

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

This custom tag can then be used in a template file:

    <div id="footer">
      {copyright('2011', 'Toyota Motor Corporation')}
    <div>

__Built-in Tags__

AE86 comes with a number of built-in tags:

* include(file)
* title()
* date(format)
* relative(path)

__include(file)__

This tag includes a partial template in another template. The file argument is relative to partials directory. E.g. include('header.html') uses partials/header.html file.

    <div id="header">
      {include('header.html')}
    </div>

__title()__

This tag displays the current page's title as configured in sitemap param.

    <title>{title()}</title>

__date(format)__

This tag displays the current time with a specified format. Check out [felixge/node-dateformat](https://github.com/felixge/node-dateformat) README page for examples of the date format.

    <div class="date">{date('dddd dd/mm/yyyy hh:MM:ssTT')}</div>

__relative(path)__

This tag renders a link as a relative path.

    <script type="text/javascript" src="{relative('scripts/global.js')}"></script>

Which will be rendered as scripts/global.js from templates under pages directory, but it will be rendered as ../scripts/global.js from templates under subdirectories of pages directory.