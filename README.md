AE86
----

Static website generator.

![http://travis-ci.org/cliffano/ae86](https://secure.travis-ci.org/cliffano/ae86.png?branch=master)

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

Create the templates (check out the Templating Guide section further below).

Generate the website:

	ae86 gen

Templating Guide
----------------

Parameters

Website parameters can be specified in an object in params.js file:

<pre>
exports.params = {
  subtitle: 'Small, lightweight, since 1983.',
  team: ['Keiichi Tsuchiya', 'Mitsu Ide', 'Dori-Kin']
}
</pre>

These parameters can then be used in a template file:

<pre>
&lt;h2&gt;{subtitle}&lt;/h2&gt;
&lt;ul&gt;
{foreach person in team}
  &lt;li&gt;{person}&lt;/li&gt;
{end}
&lt;/ul&gt;
</pre>

You also need to specify the sitemap in params.js file. The key should match the page file names under the pages directory, title and layout can be specified as the value. If layout is not specified, then layouts/default.html will be used.

<pre>
exports.params = {
  sitemap: {
    'index.html': { title: 'Home Page' },
    'products/corolla.html': { title: 'Toyota Corolla', layout: 'layouts/brochure.html' },
    'products/sprinter.html': { title: 'Toyota Sprinter', layout: 'layouts/brochure.html' },
    'contact.html': { title: 'Contact Us' }
  }
}
</pre>

Note that params.js is a Node.js module, so it can require other modules accordingly.

Custom Tags

Custom tag can be specified in params.js as a function:

<pre>
exports.params = {
	copyright: function (year, name, cb) {
		cb('Copyright &copy; ' + year + ' ' + name + '. Some Rights Reserved.');
	}
}
</pre>

Note that a custom tag function must have a callback(result) as the last argument, result will then be rendered on the template.

This custom tag can then be used in a template file:

<pre>
&lt;div id="footer"&gt;
{copyright('2011', 'Toyota Motor Corporation')}
&lt;div&gt;
</pre>

Built-in Tags

AE86 comes with a number of built-in tags:

include()

title()

date()

relative()

Partials

Layouts

Pages

Static

Place all static files (e.g. images, scripts, styles, robots.txt) in static directory. The structure of static files will be kept as is.