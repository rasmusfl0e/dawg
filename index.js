const nightmare = require("./nightmare");
const firebase = require("./firebase");
const parseHAR = require("./parseHAR");

function receiveHAR (har) {
	var data = parseHAR(har);
	store(data);
}

function makeTimestamp () {
	var d = new Date();
	var min = d.getMinutes();
	d.setMinutes(min - min % 15);
	d.setSeconds(0);
	d.setMilliseconds(0);
	d.toISOString();
	return d.toISOString().slice(0,-8).replace(/-|T/g, "/");
}

function store(data) {
	var timestamp = makeTimestamp();
	var db = firebase.database();
	var ref = db.ref(`reports/${timestamp}`);
	if (ref) {
		ref.set(data)
			.then(() => {
				db.goOffline();
			})
			.catch((error) => {
				console.error(error);
				db.goOffline();
			});
	}
	else {
		console.log("no ref to firebase");
	}
}

nightmare(receiveHAR);
