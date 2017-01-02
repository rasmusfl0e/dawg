function matchGroup (url, config) {
	for (var i = 0, l = config.length; i < l; i++) {
		if (config[i].filters && config[i].filters.some((reg) => url.match(reg))) {
			return config[i].name;
		}
	}
	return "unknown";
}

function getDomain (url) {
	var match = url.match(/https?:\/\/([^\/]+)/);
	return match && match[1] || null;
}

function kb (value) {
	return parseFloat((value/1024).toFixed(1));
}

module.exports = function (har, config) {

	// pick just the bits we want
	var entries = (har.log && har.log.entries || har.entries).map(
		({ request: { url }, response: { content: { size, compression = 0 } }}) => ({url, size, compression})
	)
	// filter out data uris
	.filter(
		({ url }) => (url.indexOf("data:") !== 0)
	);

	// group requests by context
	var details = entries.reduce(
		(result, entry) => {
			var group = matchGroup(entry.url, config);
			if (!(group in result)) {
				result[group] = [];
			}
			result[group].push(entry);
			return result;
		},
		{}
	);

	// tally up requests
	var summaryData = Object.keys(details).reduce((result, group) => {
		result[group] = details[group].reduce((subresult, { url, size, compression }) => {
			const domain = getDomain(url);
			if (subresult.domains.indexOf(domain) < 0) {
				subresult.domains.push(domain);
			}
			subresult.requests++;
			subresult.size += size;
			// negative compression means that compressed size is larger
			subresult.compressed += (compression < 0) ? size - compression : compression || size;
			return subresult;
		}, {size: 0, compressed: 0, requests: 0, domains: []});
		return result;
	}, {});

	// make a human readable summary
	var summary = Object.keys(summaryData).reduce((result, group) => {
		var { size, compressed, requests, domains } = summaryData[group];
		result[group] = {
			requests,
			"size (kb)": kb(size),
			"compressed (kb)": kb(compressed),
			domains: domains.length
		}
		return result;
	}, {});

	return {
		summary,
		details
	};

};