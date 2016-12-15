const fs = require("fs");
const Nightmare = require("nightmare");
const harPlugin = require("nightmare-har-plugin");
const parseHAR = require("./parseHAR");

harPlugin.install(Nightmare);

var options = Object.assign({}, harPlugin.getDevtoolsOptions());

var nightmare = Nightmare(options);

nightmare
	.waitForDevtools()
	.goto("http://www.dr.dk")
	.getHAR()
	.end()
	.then((result) => console.log(JSON.stringify(parseHAR(result), null, "\t")))
	.catch((error) => console.error(error));