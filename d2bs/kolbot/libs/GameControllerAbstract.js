/**
*	@filename	GameControllerAbstract.js
*	@author		CrazyCasta
*	@desc		Base object for talking with the Game Controllers in general
*/

function GameController() {
}

GameController.prototype = {
	// Profile data methods

	// Returns an object with name, password, and difficulty properties
	getGameInfo: function () {
		throw new Error("Method not defined.");
	},
	// Returns the Profile (d2bs primitive) to login with.
	getProfile: function () {
		return new Profile();
	}

	// Logging methods

	// console - the name of the console (for game controllers that support
	// this).
	printToConsole: function (msg, color, console) {
	},
	logItem: function (item, action) {
	},

	// Status methods
	updateStatus: function (msg, inGame, waitSecs) {
	},
	report: function (type) {
	},

	// Profile control methods
	restartProfile: function (profile) {
		throw new Error("Method not defined.");
	},
	stopProfile: function (profile) {
		throw new Error("Method not defined.");
	},
	startProfile: function (profile) {
		throw new Error("Method not defined.");
	},

	// Profile communication

	// Message is an object w/ msg and id properties.
	sendMessage: function (profile, message) {
		throw new Error("Method not defined.");
	},
	sendMessageAll: function (message) {
		throw new Error("Method not defined.");
	},
	// cb - function (message)
	addMessageHandler: function (cb) {
		throw new Error("Method not defined.");
	},
	removeMessageHandler: function (cb) {
		throw new Error("Method not defined.");
	},

	// SOJ related
	updateSOJCount: function () {
	},
	diabloWalksTheEarth: function () {
	}
};

const ReportType = {
	Run: 1,
	Chicken: 2,
	CDKeyInUse: 3,
	CDKeyDisabled: 4,
	CDKeyInvalid: 5,
	CDKeyFlagged: 6,
	RealmDown: 7
};
