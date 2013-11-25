recons
======

Recons is a remote javascript console inspired by [jsconsole](http://jsconsole.com)
You can install recons yourself or use a hosted version at http://recons.tk (NOT WORKING AT THE MOMENT!) 

Features
--------

* Remote device debugging
* Recieve console events
* Send javascript commands to device

Usage
-----

Recons is heavily inspired by [jsconsole](http://jsconsole.com). In fact, they share the same overall functionality, the way you embed them in your code, even most of the console commands are the same. The only significant difference is in the implementation: while jsconsole utilizes iframes, recons uses the socket.io library.

Installation
------------

This requires node.js. Once you installed it, download this project (or clone it using git) and inside the new jsconsole directory run:

`npm install`

This will install the dependencies (connect.io at the moment).
Once installed, run (on port 80):

`node server.js`

Once the server is running, point your browser to the url node.js resides on to open a console window.