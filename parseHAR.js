var contexts = {
	"marketing": [
		/^https?:\/\/animate\.adobe\.com/i,
		/^https?:\/\/downol\.dr\.dk\/download\/Forside\//i,
		/^https?:\/\/www\.dr\.dk\/(drwebstat\/adspaces\.js|creatives)/i,
		/^https?:\/\/(?:[a-z-0-9_]+\.)?cloudflare\.com/
	],
	"statistics": [
		/^https?:\/\/(?:[a-z-0-9_]+\.)?(google-analytics\.com|tns-gallup\.dk|hit\.gemius\.pl|krxd\.net|cxense\.com|doipanel\.dk|g\.doubleclick\.net|newrelic\.com|nr-data\.net|ensighten.com|dr\.dk\/drwebstat|demdex\.net|d3\.sc\.omtrdc\.net)/i,
		/^https?:\/\/www\.dr\.dk\/drdk-ensighten\/Bootstrap\.js/i
	],
	"content": [
		/^https?:\/\/(www|asset)\.dr\.dk/i
	]
};

function matchContext (url) {
	for (let context in contexts) {
		if (contexts[context].some((reg) => url.match(reg))) {
			return context;
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

module.exports = function (har) {

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
			var context = matchContext(entry.url);
			if (!(context in result)) {
				result[context] = [];
			}
			result[context].push(entry);
			return result;
		},
		{}
	);

	// tally up requests
	var summaryData = Object.keys(details).reduce((result, context) => {
		result[context] = details[context].reduce((subresult, { url, size, compression }) => {
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
	var summary = Object.keys(summaryData).reduce((result, context) => {
		var { size, compressed, requests, domains } = summaryData[context];
		result[context] = {
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