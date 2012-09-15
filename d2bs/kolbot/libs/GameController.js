/**
*	@filename	GameController.js
*	@author		kolton, D3STROY3R, CrazyCasta
*	@desc		Object for talking with the D2Bot Game Controller
*/

include("GameControllerAbstract.js");

// msgCb - function(msg), msg - object with id and msg properties
function D2Bot() {
	const CopyDataIds = {
		Join: 1,
		GameInfo: 2,
		RequestGame: 3
	};

	this.badKey = false;
	this.gameInfoUpdated = false;
	this.messageHandlerCbs = [];

	var copyDataHandler = function (obj) { return function (id, msg) {
		var i;
		switch(id) {
			case CopyDataIds.GameInfo:
				obj.gameInfoUpdated = true;
				[obj.gameName, obj.gamePass, obj.diff,
					obj.error, obj.keyswap, obj.rdblocker] = msg.split('/');

				obj.keyswap = parseInt(obj.keyswap, 10);
				obj.rdblocker = parseInt(obj.rdblocker, 10);

				break;
			default:
				for (i = 0; i < obj.messageHandlerCbs.length; i += 1) {
					obj.messageHandlerCbs[i]({id: id, msg: msg});
				}
				break;
		}
	}; }(this);

	addEventListener("copydata", copyDataHandler);

	sendCopyData(null, "D2Bot #", 0, "requestGameInfo");
	while (!this.gameInfoUpdated) {
		delay(10);
	}

	if (!getScript("tools/HeartBeat.js")) {
		load("tools/HeartBeat.js");
	}
}

D2Bot._printToItemLog = 
	function (msg, tooltip, code, color1, color2, header, gid) {
		header = header || "";
		gid = gid || "";

		sendCopyData(null, "D2Bot #", 0, "printToItemLog;" + msg + "$" + tooltip + "$" + code + "$" + header + "$" + gid + ";" + color1 + ";" + color2 + ";" + header);
	};
D2Bot._saveItem =
	function (filename, tooltip, code, color1, color2) {
		sendCopyData(null, "D2Bot #", 0, "saveItem;" + filename + "$" + tooltip + "$" + code + ";" + color1 + ";" + color2);
	};

D2Bot._heartBeat =
	function () {
		sendCopyData(null, "D2Bot #", 0, "heartBeat");
	}

var ThisGameController = D2Bot;

D2Bot.prototype = new GameController();
D2Bot.prototype.constructor = D2Bot;

D2Bot.prototype.getGameInfo =
	function () {
		this.gameInfoUpdated = false;
		sendCopyData(null, "D2Bot #", 0, "requestGameInfo");
		while (!this.gameInfoUpdated) {
			delay(10);
		}

		return {name: this.gameName, password: this.gamePass,
			difficulty: this.diff};
	};

D2Bot.prototype.printToConsole =
	function (msg, color) {
		if (arguments.length < 2) {
			sendCopyData(null, "D2Bot #", 0, "printToConsole;" + msg);
		} else {
			sendCopyData(null, "D2Bot #", 0, "printToConsole;" + msg + ";" + color);
		}
	};

D2Bot.prototype.logItem =
	function (item, action, reason, area) {
		var i, lastArea, code, desc,
			stringColor = "",
			color = -1,
			name = item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]|^ /, "");

		desc = item.description.split("\n");

		// Lines are normally in reverse. Add color tags if needed and reverse order.
		for (i = 0; i < desc.length; i += 1) {
			if (desc[i].match(/^ÿ/)) {
				stringColor = desc[i].substring(0, 3);
			} else {
				desc[i] = stringColor + desc[i];
			}
		}

		desc = desc.reverse().join("\n");
		color = item.getColor();
		desc += ("\nÿc0Item Level: " + item.ilvl);

		if (area !== undefined) {
			desc += ("\nÿc0Area: " + area);
		}

		// experimental
		/*switch (item.quality) {
		case 5:
			// needs item by item handling :/
			break;
		case 7:
			for (i = 0; i < 401; i += 1) {
				if (item.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
					code = getBaseStat(17, i, "invfile");

					break;
				}
			}

			break;
		}*/

		if (!code) {
			code = getBaseStat(0, item.classid, 'normcode') || item.code;
			code = code.replace(" ", "");

			if ([10, 12, 58, 82, 83, 84].indexOf(item.itemType) > -1) {
				code += (item.gfx + 1);
			}
		}

		if (reason) {
			desc += ("\nÿc0Line: " + reason);
		}

		D2Bot._printToItemLog(action + " " + name, desc, code, item.quality, color);
	};

D2Bot.prototype.updateStatus =
	function (msg) {
		sendCopyData(null, "D2Bot #", 0, "updateStatus;" + msg);
	};

D2Bot.prototype.report =
	function (type) {
		switch (type) {
			case ReportType.Run:
				sendCopyData(null, "D2Bot #", 0, "updateRuns");
				break;
			case ReportType.Chicken:
				sendCopyData(null, "D2Bot #", 0, "updateChickens");
				break;
			case ReportType.CDKeyInUse:
				sendCopyData(null, "D2Bot #", 0, "CDKeyInUse");
				this.badKey = true;
				break;
			case ReportType.CDKeyDisabled:
				sendCopyData(null, "D2Bot #", 0, "CDKeyDisabled");
				this.badKey = true;
				break;
			case ReportType.CDKeyInvalid:
			case ReportType.CDKeyFlagged:
				this.badKey = true;
				break;
			case ReportType.RealmDown:
				sendCopyData(null, "D2Bot #", 0, "CDKeyRD");
				sendCopyData(null, "D2Bot #", 0, "updateCount;" + getIP());
				this.badKey = true;
				break;
		}
	};

D2Bot.prototype.restartProfile = 
	function (profile) {
		if (profile !== undefined && profile !== me.profile)
			throw new Error("D2Bot # can not restart other profiles!");

		if (this.badKey) {
			sendCopyData(null, "D2Bot #", 0, "restartProfile;true");
		} else {
			sendCopyData(null, "D2Bot #", 0, "restartProfile");
		}
	};

D2Bot.prototype.stopProfile =
	function (profile) {
		if (profile !== undefined && profile !== me.profile)
			throw new Error("D2Bot # can not restart other profiles!");

		sendCopyData(null, "D2Bot #", 0, "stop");
	};

D2Bot.prototype.startProfile =
	//this starts a particular profile.ini
	function (profile) {
		sendCopyData(null, "D2Bot #", 0, "start;" + profile);
	};

D2Bot.prototype.sendMessage =
	function (profile, message) {
		sendCopyData(null, profile, message.id, message.msg);
	};

D2Bot.prototype.sendMessageAll =
	function (message) {
		sendCopyData(null, "D2Bot #", 0, "shoutGlobal;" + message.msg + ";" +
				message.id.toString() + ";");
	};

D2Bot.prototype.addMessageHandler =
	function (handler) {
		this.messageHandlerCbs.push(handler);
	};

D2Bot.prototype.removeMessageHandler =
	function (handler) {
		var i;
		for (i = 0; i < this.messageHandlerCbs.length; ++i) {
			if (handler === this.messageHandlerCbs[i]) {
				this.messageHandlerCbs.splice(i, 1);
				break;
			}
		}
	};

D2Bot.prototype.saveScreenShot =
	function (ss) {
		sendCopyData(null, "D2Bot #", 0, "saveItem;" + ss);
	};
