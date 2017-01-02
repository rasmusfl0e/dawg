const nightmare = require("./nightmare");
const firebase = require("./firebase");
const parseHAR = require("./parseHAR");
const config = require("./config.json");

config.forEach(
	({name, filters}) => filters.forEach(
		(filter, index) => { filters[index] = new RegExp(filter, "i"); }
	)
);

function processMeaurements ({har, dimensions}) {
	if (har) {
		var data = parseHAR(har, config);
		console.log(data);
	}
	console.log(dimensions);
	//store(data);
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
			});
	}
	else {
		console.log("no ref to firebase");
	}
}

nightmare(processMeaurements, config);
