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
	Character:18,
	ProfilerStarted: 19
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
	addEventListener("copydata", function (id, msg) {
		switch (id) {
			case OOGsMessageIds.Ping:
				sendCopyData(null, hWnd, OOGsMessageIds.Pong, "");
				break;
		}
	});
}

for (i in GameController.prototype) {
	OOGsGameController.prototype[i] = GameController.prototype[i];
}

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

	sendCopyData(null, hWnd, 256, "");

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

OOGsGameController.prototype.addMessageHandler = function (cb) {
	print("FIX FIX FIX!!!");
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
