var firebase = require("firebase/app-node");
require("firebase/database-node");

var config = {
	apiKey: "AIzaSyAdw0DdOFYmwrP2UGc5LAqtepseCJKgnN4",
	authDomain: "dawg-298cc.firebaseapp.com",
	databaseURL: "https://dawg-298cc.firebaseio.com",
	storageBucket: "dawg-298cc.appspot.com",
	messagingSenderId: "142212061375"
};

firebase.initializeApp(config);

module.exports = firebase;