recons
======

Recons is a remote javascript console inspired by [jsconsole](http://jsconsole.com)

Features
--------

* Remote device debugging
* Recieve console events
* Send javascript commands to device

Usage
-----

Recons is heavily inspired by [jsconsole](http://jsconsole.com). In fact, they share the same overall functionality, even most of the console commands are the same. The only significant difference is in the implementation: while jsconsole utilizes iframes, recons uses the socket.io library.

Installation
------------

This requires node.js. Once you installed it, download this project (or clone it using git) and inside the new jsconsole directory run:

npm install

This will install the dependencies (in particular 1.8.x version of connect.js).

Once installed, run (on port 80):

node server.js
