const Nightmare = require("nightmare");
const harPlugin = require("nightmare-har-plugin");

harPlugin.install(Nightmare);

var options = Object.assign({}, harPlugin.getDevtoolsOptions(), {width: 980, height: 600, show: true});

var nightmare = Nightmare(options);

module.exports = function (callback, config) {
	var measurements = {};
	nightmare
	.waitForDevtools()
	.goto(config.url)
	// Retrieve real estate data
	.evaluate((config) => {

		function getElements(selector) {
			return Array.prototype.slice.call(document.querySelectorAll(selector));
		}

		function getPixels (element) {
			var rect = element.getBoundingClientRect();
			return rect.width * rect.height;
		}

		function getElementPixels (selector) {
			return getElements(selector).reduce(
				(sum, element) => sum + getPixels(element),
				0
			);
		}

		return config.categories.reduce(
			(dimensions, {name, selector}) => {
				dimensions[name] = (selector) ? getElementPixels(selector) : 0;
				return dimensions;
			},
			{
				page: getPixels(document.documentElement)
			}
		);

	}, config)
	.then((dimensions) => {
		measurements.dimensions = dimensions;

		// Retrieve HAR data
		nightmare.getHAR()
		.end()
		.then((har) => {
			measurements.har = har;
			callback(measurements);
		});

	})
	.catch((error) => console.error(error));
};
