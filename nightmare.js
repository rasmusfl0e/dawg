const Nightmare = require("nightmare");
const harPlugin = require("nightmare-har-plugin");

harPlugin.install(Nightmare);

var options = Object.assign({}, harPlugin.getDevtoolsOptions(), {width: 800, height: 600, frame: false});

var nightmare = Nightmare(options);

module.exports = function (callback) {
	nightmare
	.waitForDevtools()
	.goto("http://www.dr.dk")
	.getHAR()
	.end()
	.then((result) => callback(result))
	.catch((error) => console.error(error));
};
