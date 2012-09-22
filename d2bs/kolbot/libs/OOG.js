/**
*	@filename	OOG.js
*	@author		kolton, D3STROY3R
*	@desc		handle out of game operations like creating characters/accounts, maintaining profile datafiles, d2bot# logging etc.
*/

include("GameControllerAbstract.js")

var gcConstructor = getConstructor();

var Controller = new gcConstructor();

var Messages = {
	JoinMeMsg: function (gameName, gameCount, gamePass, isUp) {
		this.id = 1;
		this.msg = gameName + gameCount + "/" + gamePass + "/" + isUp;
	},
	RequestGameMsg: function () {
		this.id = 3;
		this.msg = me.profile;
	}
};

var GameDataCommunicator = function () {
	const CopyDataIds = {
		Join: 1,
		RequestGame: 3
	};
	var nextGame, gamePass, isUp = "no";

	var msgHandler = function (msg) {
		var resp;
		switch(msg.id) {
			case CopyDataIds.Join:
				[nextGame, gamePass, isUp] = msg.msg.split('/');
				break;
			case CopyDataIds.RequestGame:
				resp = {
					id: CopyDataIds.Join,
					msg: me.gamename + "/" + me.gamepassword + "/" + isUp
				};
				Controller.sendMessage(msg.msg, resp);
				break;
		}
	};

	var scrMsgHandler = function (id, _isUp) {
		if (id === "GameDataCommunicator.setIsUp") {
			isUp = _isUp;
		}
	};

	Controller.addMessageHandler(msgHandler);
	addEventListener("scriptmsg", scrMsgHandler);

	return {
		setIsUp: function (_isUp) {
			scriptBroadcast("GameDataCommunicator.setIsUp", _isUp);
		},
		getGameData: function (profile) {
			var i;
			var req = {
				id: CopyDataIds.RequestGame,
				msg: me.profile
			};
			nextGame = undefined;
			while (nextGame === undefined) {
				Controller.sendMessage(profile, req);
				delay(1000);
			}
			return {
				nextGame: nextGame,
				gamePass: gamePass,
				isUp: isUp
			};
		}
	};
}();

var DataFile = {
	create: function () {
		var obj, string;

		obj = {
			runs: 0,
			experience: 0,
			deaths: 0,
			lastArea: "",
			gold: 0,
			level: 0
		};

		string = JSON.stringify(obj);

		FileTools.writeText("data/" + me.profile + ".json", string);

		return obj;
	},

	getObj: function () {
		var obj, string;

		if (!FileTools.exists("data/" + me.profile + ".json")) {
			DataFile.create();
		}

		string = FileTools.readText("data/" + me.profile + ".json");

		try {
			obj = JSON.parse(string);
		} catch (e) {
			// If we failed, file might be corrupted, so create a new one
			obj = this.create();
		}

		return obj;
	},

	getStats: function () {
		var obj = this.getObj();

		return {runs: obj.runs, experience: obj.experience, lastArea: obj.lastArea, gold: obj.gold, level: obj.level};
	},

	updateStats: function (arg, value) {
		var obj, string, area;

		obj = this.getObj();

		switch (arg) {
		case "runs":
			obj.runs = value;

			break;
		case "experience":
			obj.experience = me.getStat(13);
			obj.level = me.getStat(12);

			break;
		case "lastArea":
			area = getArea();

			if (typeof area !== "object") {
				return;
			}

			if (obj.lastArea === getArea().name) {
				return;
			}

			obj.lastArea = getArea().name;

			break;
		case "gold":
			obj.gold = me.getStat(14) + me.getStat(15);

			break;
		}

		string = JSON.stringify(obj);

		FileTools.writeText("data/" + me.profile + ".json", string);
	},

	updateDeaths: function () {
		var obj, string;

		obj = this.getObj();
		obj.deaths = obj.deaths + 1;
		string = JSON.stringify(obj);

		FileTools.writeText("data/" + me.profile + ".json", string);
	}
};

var ControlAction = {
	click: function (type, x, y, xsize, ysize, targetx, targety) {
		var control = getControl(type, x, y, xsize, ysize);

		if (!control) {
			print("control not found " + type + " " + x + " " + y);
			return false;
		}

		//delay(clickdelay);
		delay(200);
		control.click(targetx, targety);

		return true;
	},

	setText: function (type, x, y, xsize, ysize, text) {
		var control = getControl(type, x, y, xsize, ysize);

		if (!control) {
			return false;
		}

		//delay(textdelay);
		delay(200);
		control.setText(text);

		return true;
	},

	getText: function (type, x, y, xsize, ysize) {
		var control = getControl(type, x, y, xsize, ysize);

		if (!control) {
			return false;
		}

		return control.getText();
	},

	clickRealm: function (realm) {
		if (realm < 0 || realm > 3) {
			throw new Error("clickRealm: Invalid realm!");
		}

		var control, currentRealm;

		me.blockMouse = true;

MainLoop:
		while (true) {
			switch (getLocation()) {
			case 8:
				control = getControl(6, 264, 391, 272, 25);

				if (control) {
					switch (control.text.split(getLocaleString(11049).substring(0, getLocaleString(11049).length - 2))[1]) {
					case "U.S. EAST":
						currentRealm = 1;

						break;
					case "U.S. WEST":
						currentRealm = 0;

						break;
					case "ASIA":
						currentRealm = 2;

						break;
					case "EUROPE":
						currentRealm = 3;

						break;
					}
				}

				if (currentRealm === realm) {
					break MainLoop;
				}

				this.click(6, 264, 391, 272, 25);

				break;
			case 27:
				this.click(4, 257, 500, 292, 160, 403, 350 + realm * 25);
				this.click(6, 281, 538, 96, 32);

				break;
			}

			delay(500);
		}

		me.blockMouse = false;

		return true;
	},

	loginAccount: function (info) {
		var tick;

		me.blockMouse = true;

		var realms = {
			"uswest": 0,
			"useast": 1,
			"asia": 2,
			"europe": 3
		};

		tick = getTickCount();

MainLoop:
		while (true) {
			switch (getLocation()) {
			case 8: // main menu
				if (info.realm) {
					ControlAction.clickRealm(realms[info.realm]);
				}

				this.click(6, 264, 366, 272, 35);

				break;
			case 9: // login screen
				this.setText(1, 322, 342, 162, 19, info.account);
				this.setText(1, 322, 396, 162, 19, info.password);
				this.click(6, 264, 484, 272, 35); // log in

				break;
			case 11:
				// Unable to connect, let the caller handle it.
				me.blockMouse = false;
				return false;
			case 18: // splash
			case 12: // char screen - break
				break MainLoop;
			case 18: // splash
				this.click(2, 0, 599, 800, 600);

				break;
			case 21: // connecting
			case 23: // char screen connecting
				break;
			case 42: // empty char screen
				// make sure we're not on connecting screen
				delay(2000);

				if (getLocation() === 23) {
					break;
				}

				break MainLoop; // break if we're sure we're on empty char screen
			default:
				me.blockMouse = false;

				return false;
			}

			if (getTickCount() - tick >= 20000) {
				return false;
			}

			delay(500);
		}

		delay(1000);

		me.blockMouse = false;

		return getLocation() === 12 || getLocation() === 42;
	},

	makeAccount: function (info) {
		me.blockMouse = true;

		var realms = {
			"uswest": 0,
			"useast": 1,
			"asia": 2,
			"europe": 3
		};

		while (getLocation() !== 42) {// cycle until in empty char screen
			switch (getLocation()) {
			case 8: // main menu
				ControlAction.clickRealm(realms[info.realm]);
				this.click(6, 264, 366, 272, 35);

				break;
			case 9: // login screen
				this.click(6, 264, 572, 272, 35);

				break;
			case 18: // splash
				this.click(2, 0, 599, 800, 600);

				break;
			case 29: // Char create
				this.click(6, 33, 572, 128, 35);

				break;
			case 31: // ToU
				this.click(6, 525, 513, 128, 35);

				break;
			case 32: // new account
				this.setText(1, 322, 342, 162, 19, info.account);
				this.setText(1, 322, 396, 162, 19, info.password);
				this.setText(1, 322, 450, 162, 19, info.password);
				this.click(6, 627, 572, 128, 35);

				break;
			case 33: // please read
				this.click(6, 525, 513, 128, 35);

				break;
			case 34: // e-mail
				if (getControl(6, 415, 412, 128, 35)) {
					this.click(6, 415, 412, 128, 35);
				} else {
					this.click(6, 265, 572, 272, 35);
				}

				break;
			default:
				break;
			}

			delay(500);
		}

		me.blockMouse = false;

		return true;
	},

	findCharacter: function (info) {
		var control, text;

		if (getLocation() === 12) {
			control = getControl(4, 37, 178, 200, 92);

			if (control) {
				do {
					text = control.getText();

					if (text instanceof Array && typeof text[1] === "string" && text[1] === info.charName) {
						return true;
					}
				} while (control.getNext());
			}
		}

		return false;
	},

	// get all characters
	getCharacters: function () {
		var control, text,
			list = [];

		if (getLocation() === 12) {
			control = getControl(4, 37, 178, 200, 92);

			if (control) {
				do {
					text = control.getText();

					if (text instanceof Array && typeof text[1] === "string") {
						list.push(text[1]);
					}
				} while (control.getNext());
			}
		}

		return list;
	},

	// get character position
	getPosition: function () {
		var control, text,
			position = 0;

		if (getLocation() === 12) {
			control = getControl(4, 37, 178, 200, 92);

			if (control) {
				do {
					text = control.getText();

					if (text instanceof Array && typeof text[1] === "string") {
						position += 1;
					}
				} while (control.getNext());
			}
		}

		return position;
	},

	loginCharacter: function (info) {
		me.blockMouse = true;

		var control, text;

		while (getLocation() !== 1) { // cycle until in lobby
			switch (getLocation()) {
			case 12: // character select
				control = getControl(4, 37, 178, 200, 92);

				if (control) {
					do {
						text = control.getText();

						if (text instanceof Array && typeof text[1] === "string" && text[1].toLowerCase() === info.charName.toLowerCase()) {
							control.click();
							this.click(6, 627, 572, 128, 35);

							break;
						}
					} while (control.getNext());
				}

				break;
			case 42: // empty character select
				this.click(6, 33, 572, 128, 35);
				break;
			default:
				break;
			}

			delay(500);
		}

		me.blockMouse = false;

		return true;
	},

	makeCharacter: function (info) {
		me.blockMouse = true;

		if (!info.charClass) {
			info.charClass = "barbarian";
		}

		var clickCoords = [];

		while (getLocation() !== 1) { // cycle until in lobby
			switch (getLocation()) {
			case 12: // character select
			case 42: // empty character select
				this.click(6, 33, 528, 168, 60);

				break;
			case 29: // select character
				switch (info.charClass) {
				case "barbarian":
					clickCoords = [400, 280];

					break;
				case "amazon":
					clickCoords = [100, 280];

					break;
				case "necromancer":
					clickCoords = [300, 290];

					break;
				case "sorceress":
					clickCoords = [620, 270];

					break;
				case "assassin":
					clickCoords = [200, 280];

					break;
				case "druid":
					clickCoords = [700, 280];

					break;
				case "paladin":
					clickCoords = [521, 260];

					break;
				}

				// coords:
				// zon: 100, 280
				// barb: 400, 280
				// necro: 300, 290
				// sin: 200, 280
				// paladin: 521 260
				// sorc: 620, 270
				// druid: 700, 280

				getControl().click(clickCoords[0], clickCoords[1]);
				delay(500);

				break;
			case 15: // new character
				if (getControl(6, 421, 337, 96, 32)) { // hardcore char warning
					this.click(6, 421, 337, 96, 32);
				} else {
					this.setText(1, 318, 510, 157, 16, info.charName);

					if (!info.expansion) {
						this.click(6, 319, 540, 15, 16);
					}

					if (!info.ladder) {
						this.click(6, 319, 580, 15, 16);
					}

					if (info.hardcore) {
						this.click(6, 319, 560, 15, 16);
					}

					this.click(6, 627, 572, 128, 35);
				}

				break;
			case 30: // char name exists
				ControlAction.click(6, 351, 337, 96, 32);

				me.blockMouse = false;

				return false;
			default:
				break;
			}

			delay(500);
		}

		me.blockMouse = false;

		return true;
	}
};

var ShitList = {
	create: function () {
		var string,
			obj = {
				shitlist: []
			};

		string = JSON.stringify(obj);

		FileTools.writeText("shitlist.json", string);

		return obj;
	},

	getObj: function () {
		var obj,
			string = FileTools.readText("shitlist.json");

		try {
			obj = JSON.parse(string);
		} catch (e) {
			obj = this.create();
		}

		return obj;
	},

	read: function () {
		var obj;

		if (!FileTools.exists("shitlist.json")) {
			this.create();
		}

		obj = this.getObj();

		return obj.shitlist;
	},

	add: function (name) {
		var obj, string;

		obj = this.getObj();

		obj.shitlist.push(name);

		string = JSON.stringify(obj);

		FileTools.writeText("shitlist.json", string);
	}
};
