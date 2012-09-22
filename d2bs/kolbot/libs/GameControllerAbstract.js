/**
*	@filename	GameControllerAbstract.js
*	@author		CrazyCasta
*	@desc		Base object for talking with the Game Controllers in general
*/

function getConstructor() {
	var obj = {constructor: undefined};

	while (obj.constructor === undefined) {
		scriptBroadcast("getGameCnt", obj);
		delay(20);
	}

	return obj.constructor;
}

function GameController() {
}


// Profile data methods

// Returns an object with name, password, and difficulty properties
GameController.prototype.getGameInfo = function () {
	throw new Error("Method not defined.");
};

// Returns the Profile (d2bs primitive) to login with.
GameController.prototype.getProfile = function () {
	return new Profile();
};

// Logging methods

// console - the name of the console (for game controllers that support
// this).
GameController.prototype.printToConsole = function (msg, color, console) {
};
GameController.prototype.logItem = function (item, action) {
};

// Status methods
GameController.prototype.updateStatus = function (msg, inGame, waitSecs) {
};
GameController.prototype.report = function (type) {
};

// Profile control methods
GameController.prototype.restartProfile = function (profile) {
	throw new Error("Method not defined.");
};
GameController.prototype.stopProfile = function (profile) {
	throw new Error("Method not defined.");
};
GameController.prototype.startProfile = function (profile) {
	throw new Error("Method not defined.");
};

// Profile communication

// Message is an object w/ msg and id properties.
GameController.prototype.sendMessage = function (profile, message) {
	throw new Error("Method not defined.");
};
GameController.prototype.sendMessageAll = function (message) {
	throw new Error("Method not defined.");
};
// cb - function (message)
GameController.prototype.addMessageHandler = function (cb) {
	throw new Error("Method not defined.");
};
GameController.prototype.removeMessageHandler = function (cb) {
	throw new Error("Method not defined.");
};

// SOJ related
GameController.prototype.updateSOJCount = function () {
};
GameController.prototype.diabloWalksTheEarth = function () {
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
