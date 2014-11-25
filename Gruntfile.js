/*global module */
module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		jshint: {
			src: [
				"**/*.js",
				"!node_modules/**/*.js",
				"!demos/**",
				"!tests/**",
				"!samples/**/*.js",

				// Note: skip this file since it gives a JSHint error about a character being silently deleted.
				// It will have to be fixed by the translators.
				"!nls/he/loading.js"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		}

	});

	// Load plugins
	grunt.loadNpmTasks("grunt-contrib-jshint");
};
