recons
======

`recons` is a remote javascript console inspired by [jsconsole](http://jsconsole.com)
You can install `recons` yourself or use a hosted version at http://recons.tk 

Features
--------

* Remote device debugging
* Recieve console events
* Send javascript commands to device

Usage
-----

Recons is heavily inspired by [jsconsole](http://jsconsole.com). In fact, they share the same overall functionality, the way you embed them in your code, even most of the console commands are similar. The only significant difference is in the implementation: while jsconsole utilizes iframes, `recons` uses the [socket.io](http://socket.io) library.
The application and the remote console are connected via an id. Application(s) with the same id broadcast to the console window(s) listening to that id and the other way around.
Opening a fresh console window provides a new id in the [guid](http://en.wikipedia.org/wiki/Globally_unique_identifier) format unless set one explicitly. This can be obtained by concatenating the id after the console window url, for example
http://recons.tk?my-own-id

Once the id is given, you can inject the client-side code by adding 

    <!-- start of remote console code -->
    <script src="https://demo-project-c9-gaborkoos.c9.io/socket.io/socket.io.js"></script>
    <script src="https://demo-project-c9-gaborkoos.c9.io/recons.js?id"></script>
    <!-- end of remote console code --> 

to your source code, before any other script tag. Obviously, in case of hosting `recons` somewhere else the recons.tk part changes accordingly.

When done, browsing your application you are able to see the console messages in your recons window from where you are also able to send back javascript commands that execute in the context of the application being observed.

Installation
------------

This requires node.js. Once you installed it, download this project (or clone it using git) and inside the new jsconsole directory run:

`npm install`

This will install the dependencies (`socket.io` at the moment).
Once installed, run (on port 80):

`node server.js`

Once the server is running, point your browser to the url where node.js resides on to open a console window.

Supported console events
------------------------

As of now, the following methods fire in the remote console:
* console.log()
* console.debug()
* console.info()
* console.warn()
* console.error()

It is worth mentioning that the aforementioned functions work even if there is no console object in the browser where the application is running or console itself exists but some of the methods are not defined.