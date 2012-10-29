include("GameControllerAbstract.js");

var hWnd;
var profile;

const OOGsMessageIds = {
	CreateGame: 1,
	JoinGame: 2,
	EnterChat: 3,
	SendMessage: 4,
	GetMessages: 5,
	GetGameList: 6,
	Login: 7,
	SelectCharacter: 8,
	GetCharList: 9,
	Ping: 10,
	Pong: 11,
	OOGLocation: 12,
	ReceivedMessage: 13,
	EnteredGame: 14,
	FailedToJoin: 15,
	GameDoesNotExist: 16,
	GameList: 17,
	Character: 18,
	ProfilerStarted: 19,
	Failure: 20,
	UpdateStatus: 21,
	Log: 22
};

const KolbotMessageIds = {
	GameData: 256,
	Start: 257,
	Stop: 258,
	Restart: 259
}

function hWndSetter(cmd, hWndIn) {
	if (cmd === "hWnd") {
		hWnd = hWndIn;
		sendCopyData(null, hWnd, OOGsMessageIds.ProfilerStarted, "");
	}
}

function profilerGenner(cmd, pt, acct, pw, chr, gw) {
	if (cmd === "new Profile") {
		profile = new Profile(pt, acct, pw, chr, gw);

		// If we can, send a ping
		if (hWnd !== undefined) {
			sendCopyData(null, hWnd, OOGsMessageIds.Pong, "");
		}
	}
}

function OOGsGameController() {
	this.messageHandlerCbs = [];

	addEventListener("copydata", function (_this) { return function (id, msg) {
		var i;

		switch (id) {
			case OOGsMessageIds.Ping:
				sendCopyData(null, hWnd, OOGsMessageIds.Pong, "");
				break;
		}

		if (id >= 512)
		{
			for (i = 0; i < _this.messageHandlerCbs.length; i += 1) {
				_this.messageHandlerCbs[i]({id: id - 512, msg: msg});
			}
		}
	}; }(this));
}

for (i in GameController.prototype) {
	OOGsGameController.prototype[i] = GameController.prototype[i];
}

OOGsGameController.prototype._sendCopyData = function (id, msg) {
	sendCopyData(null, hWnd, id, msg);
};

OOGsGameController.prototype.getGameInfo = function () {
	var gameInfo = {name: "", password: "", description: "", difficulty: "",
		levelDifference: undefined, maxPlayers: 8};
	var gotInfo = false;
	var aFunc;

	addEventListener("copydata", aFunc = function (id, msg) {
		if (id === OOGsMessageIds.CreateGame) {
			[gameInfo.name, gameInfo.password, gameInfo.description,
				gameInfo.difficulty, gameInfo.levelDifference,
				gameInfo.maxPlayers] = msg.split("/");
			gameInfo.difficulty = parseInt(gameInfo.difficulty);
			// TODO: get rid of this kludge
			switch (gameInfo.difficulty) {
				case 0:
					gameInfo.difficulty = "Normal";
					break;
				case 1:
					gameInfo.difficulty = "Nightmare";
					break;
				case 2:
					gameInfo.difficulty = "Hell";
					break;
			}
			gotInfo = true;
		}
	});

	while (hWnd === undefined) {
		delay(10);
	}

	this._sendCopyData(256, "");

	while (!gotInfo) {
		delay(10);
	}

	removeEventListener("copydata", aFunc);

	return gameInfo;
};

OOGsGameController.prototype.getProfile = function () {
	while (profile === undefined) {
		delay(10);
	}

	return profile;
};

OOGsGameController.prototype.printToConsole = function (msg, color, console) {
	var _msg;

	const colorTable = [
		"#000000", // 0
		"#000000", // 1
		"#000000", // 2
		"#000000", // 3
		"#0000FF", // 4
		"#008000", // 5
		"#B8860B", // 6
		"#8B4513", // 7
		"#FF8C00", // 8
		"#FF0000", // 9
		"#808080", // 10
		"#000000", // 11
		"#000000", // 12
		"#000000", // 13
		"#000000", // 14
		"#000000", // 15
	];

	if (color !== undefined) {
		if (typeof(color) === "string" && color[0] === "#") {
			_msg = "" + color + ",";
		} else {
			_msg = colorTable[Number(color)] + ",";
		}
	} else {
		_msg = "default,"
	}

	if (console !== undefined) {
		_msg += console + ",";
	} else {
		_msg += "default,";
	}

	_msg += msg;

	this._sendCopyData(OOGsMessageIds.Log, _msg);
};

OOGsGameController.prototype.updateStatus = function (msg, inGame, waitSecs) {
	var _msg = msg;

	if (waitSecs !== undefined) {
		_msg += " - " + waitSecs;
	}

	this._sendCopyData(OOGsMessageIds.UpdateStatus, _msg);
};

OOGsGameController.prototype.restartProfile = function (profile) {
	if (profile === undefined) {
		profile = me.profile;
	}

	this._sendCopyData(KolbotMessageIds.Restart, profile);
};

OOGsGameController.prototype.stopProfile = function (profile) {
	if (profile === undefined) {
		profile = me.profile;
	}

	this._sendCopyData(KolbotMessageIds.Stop, profile);
};

OOGsGameController.prototype.startProfile = function (profile) {
	this._sendCopyData(KolbotMessageIds.Start, profile);
};

OOGsGameController.prototype.sendMessage = function (profile, message) {
	this._sendCopyData(message.id + 512, profile + "]" + message.msg);
};

OOGsGameController.prototype.sendMessageAll = function (message) {
	this.sendMessage("*", message);
};

OOGsGameController.prototype.addMessageHandler = function (cb) {
	this.messageHandlerCbs.push(cb);
};

OOGsGameController.prototype.removeMessageHandler = function (cb) {
	var i;
	for (i = 0; i < this.messageHandlerCbs.length; ++i) {
		if (cb === this.messageHandlerCbs[i]) {
			this.messageHandlerCbs.splice(i, 1);
			break;
		}
	}
};

function gameCntGiver(cmd, obj) {
	if (cmd === "getGameCnt") {
		obj.constructor = OOGsGameController;
	}
}

function main() {
	hWnd = undefined;
	profile = undefined;

	addEventListener("scriptmsg", profilerGenner);
	addEventListener("scriptmsg", hWndSetter);

	// Anyone asking for a profile can go shove it until we have an hWnd and a
	// profile.
	while (hWnd === undefined || profile === undefined) {
		delay(10);
	}

	addEventListener("scriptmsg", gameCntGiver);

	while (true) {
		delay(1000);
	}
}
