![http://travis-ci.org/cliffano/ae86](https://secure.travis-ci.org/cliffano/ae86.png?branch=master)

AE86
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

Create the templates (check out the Templating Guide section further below).

Generate the website:

	ae86 gen

