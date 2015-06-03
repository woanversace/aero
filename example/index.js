"use strict";

let runExample = function (silent) {
	// Modules
	let aero = require("../src");

	// Measure startup time
	let startUp = 0;

	// Change directory
	require("process").chdir(__dirname);

	// Run
	startUp = Date.now();
	aero.run();

	if(!silent) {
		// Do something when initialized
		aero.events.on("initialized", function() {
			console.log(aero.config.siteName + " has been initialized now!");
		});

		// Startup time
		aero.events.on("server started", function() {
			console.log("Server startup: " + (Date.now() - startUp) + " ms");
		});

		// Do something when ready
		aero.events.on("ready", function() {
			console.log(aero.config.siteName + " is ready to serve content now!");
		});
	}

	// Special route
	aero.get("/very/special/route", function(request, response) {
		response.end("Very special indeed!");
	});

	// Google+ style routing
	aero.get(/^\+(.*)/, function(request, response) {
		response.end("Google+ style routing");
	});

	// Middleware
	aero.use(function(req, res, next) {
		//console.log("URL:", req.url);
		next();
	});
	
	aero.use(function(req, res, next) {
		//console.log("Time:", new Date());
		next();
	});
};

if(module === require.main)
	runExample();
else
	module.exports = runExample;