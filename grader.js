#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var util = require('util');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var urlFile="tmpHtm.html";

var checkJson;
var outJson;
var HTMLFILE_DEFAULT = "index.html";
var URL_DEFAULT = "http://cryptic-lake-6197.herokuapp.com";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); 
    }
    return instr;
};


var buildFn = function(urlFile) {
    var response2String = function(result, response) {
	if (result instanceof Error) {
            console.error('Error: ' + result.message);
	} else {
	    fs.writeFileSync(urlFile,result);
	    checkJson = checkHtmlFile(urlFile, program.checks);
	    outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	}    
    };
    return response2String;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Url to html file')
        .parse(process.argv);
    if (program.url) {
	var response2String = buildFn(urlFile);
	var urlString= util.format('%s',program.url);
	rest.get(urlString).on('complete',response2String);
	}
    else { //assume file invoked
	checkJson = checkHtmlFile(program.file, program.checks);
        outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
	}
    }
    else {
    exports.checkHtmlFile = checkHtmlFile;
}
