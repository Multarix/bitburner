/** @type {Object<string, Network>} NetworkList */
let allNetworks = new Object();

/**
 * @name scan
 * @param {NS} ns
 * @param {string} hostName
 * @param {boolean} [clear=true]
 **/
export function scanNetworks(ns, hostName, clear = false){
	if(clear) allNetworks = new Object();
	const scanResults = ns.scan(hostName); // Scan the server;

	for(const host of scanResults){
		if(host === "home") continue; // Skip if home
		if(allNetworks[host]) continue; // Skip if already in the network
		allNetworks[host] = new Object();
		allNetworks[host].name = host;
		allNetworks[host].hackLevel = ns.getServerRequiredHackingLevel(host);
		allNetworks[host].ports = ns.getServerNumPortsRequired(host);
		allNetworks[host].maxMoney = ns.getServerMaxMoney(host);

		scanNetworks(ns, host);
	}

	return allNetworks;
}


/**
 *
 * @param {number} progress A number that is greater or equal to 0, but less than or equal to 1
 * @param {string} filled The string that will be used represent filled portions of the bar
 * @param {string} empty The string that will be used to represent empty portions of the bar
 */
export function progressBar(progress, filled = "#", empty = " "){
	if(typeof progress !== "number") throw "progress is not a number!";
	if(progress > 1 || 0 > progress) throw "progress must be between 0 and 1";

	const multTen = Math.round(progress * 10);
	const progressBarStr = "".padEnd(multTen, filled).padEnd(10, empty);
	return progressBarStr;
}


/**
 *
 * @param {NS} ns
 * @param {string} host
 * @param {string} target
 * @param {string[]} checked
 * @returns {string[]}
 */
export function treeTraverse(ns, host, target, checked = []){
	const connections = ns.scan(host);
	for(const server of connections){
		if(server === "home") continue; // We've clearly backtracked
		if(checked.includes(server)) continue;

		if(server === target) return [server];

		const result = treeTraverse(ns, server, target, [...checked, server]);
		if(result.length > 0){ // We found it
			result.push(server);
			return result;
		}
	}

	return [];
}


/**
 * @description Attempts to gain root access on a given server
 * @param {NS} ns
 * @param {string} target
 **/
export function gainRoot(ns, target){
	if(!ns.hasRootAccess(target)){
		let ports = 0;
		let nuked = false;
		if(ns.fileExists("brutessh.exe", "home")){
			ports += 1;
			ns.brutessh(target);
		}

		if(ns.fileExists("ftpcrack.exe", "home")){
			ports += 1;
			ns.ftpcrack(target);
		}

		if(ns.fileExists("httpworm.exe", "home")){
			ports += 1;
			ns.httpworm(target);
		}

		if(ns.fileExists("relaysmtp.exe", "home")){
			ports += 1;
			ns.relaysmtp(target);
		}

		if(ns.fileExists("sqlinject.exe", "home")){
			ports += 1;
			ns.sqlinject(target);
		}

		if(ns.fileExists("nuke.exe", "home")){
			if(ports >= ns.getServerNumPortsRequired(target)) nuked = ns.nuke(target);
		}

		// if(nuked) if(ns.fileExists()) ns.installBackdoor()
		ns.toast(`Opened ${ports} ports ${(nuked) ? "and successfully gained root access " : ""}on ${target}`, "success", 10000);
	}
}


export function getMaxPorts(ns){
	let ports = 0;

	if(ns.fileExists("brutessh.exe", "home")) ports += 1;
	if(ns.fileExists("ftpcrack.exe", "home")) ports += 1;
	if(ns.fileExists("httpworm.exe", "home")) ports += 1;
	if(ns.fileExists("relaysmtp.exe", "home")) ports += 1;
	if(ns.fileExists("sqlinject.exe", "home")) ports += 1;

	return ports;
}

export function serverSort(a, b){
	const aNum = parseInt(a.split("-")[1]);
	const bNum = parseInt(b.split("-")[1]);

	return aNum - bNum;
}


/**
 * @description Converts a number to into abbreviated form (Up to octillion)
 * @param {number} num
 **/
export function numberConvert(num){
	if(typeof num === "string") num = parseFloat(num);
	if(isNaN(num)) throw "'num' is not a valid number!";

	const symbols = ["", "k", "m", "b", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];

	let i;
	for(i = 0; (num >= 1000) && (i < symbols.length); i++){
		num /= 1000;
	}

	return num.toFixed(3) + symbols[i];
}


/**
 * @param {number} ms
 * @returns {number | string}
 * @description Converts a time represented in milliseconds to Hours/ Minutes/ Seconds
 **/
export function timeConvert(ms){
	ms = parseInt(ms);
	if(isNaN(ms)) return NaN;
	if(!ms || 1000 > ms) ms = 1000;
	const secondsRAW = ms / 1000;
	const seconds = secondsRAW % 60;

	const minutesRAW = secondsRAW / 60;
	let minutes = minutesRAW % 60;

	const hoursRAW = minutesRAW / 60;
	let hours = hoursRAW % 24;

	if(hours < 1) hours = 0;
	if(minutes < 1) minutes = 0;

	const timeArray = [];
	if(Math.floor(hours) >= 1) timeArray.push(`${Math.floor(hours)}h`);
	if(Math.floor(hours) >= 1 || Math.floor(minutes) >= 1){
		const precedingZero = (hours > 0 && minutes < 10) ? "0" : "";
		timeArray.push(`${precedingZero}${Math.floor(minutes)}m`);
	}
	if(Math.floor(hours) >= 1 || Math.floor(minutes) >= 1 || Math.floor(seconds) >= 1){
		const precedingZero = ((minutes > 0 && seconds < 10) || (hours > 0 && seconds < 10)) ? "0" : "";
		timeArray.push(`${precedingZero}${Math.floor(seconds)}s`);
	}

	const timeString = (timeArray.length > 1) ? timeArray.join(" ") : timeArray[0];
	return timeString;
}


/**
 * Makes the log's text black
 * @param {string} text
**/
export function black(text){
	return "\u001b[30m" + text + "\u001b[0m";
}


/**
* Makes the log's text red
* @param {string} text
**/
export function red(text){
	return "\u001b[31m" + text + "\u001b[0m";
};


/**
 * Makes the log's text green
 * @param {string} text
 **/
export function green(text){
	return "\u001b[32m" + text + "\u001b[0m";
};


/**
 * Makes the log's text yellow
 * @param {string} text
 **/
export function yellow(text){
	return "\u001b[33m" + text + "\u001b[0m";
};


/**
 * Makes the log's text blue
 * @param {string} text
 **/
export function blue(text){
	return "\u001b[34m" + text + "\u001b[0m";
};


/**
 * Makes the log's text magenta
 * @param {string} text
 **/
export function magenta(text){
	return "\u001b[35m" + text + "\u001b[0m";
};


/**
 * Makes the log's text cyan
 * @param {string} text
 **/
export function cyan(text){
	return "\u001b[36m" + text + "\u001b[0m";
};


/**
 * Makes the log's text white
 * @param {string} text
 **/
export function white(text){
	return "\u001b[37m" + text + "\u001b[0m";
};


/**
 * @typedef {"Black"|"LBrown"|"DRed"|"Red"|"LRed"|"Orange"|"Yellow"|"LYellow"|"DGreen"|"Green"|"LGreen"|"DBlue"|"Blue"|"Cyan"|"LCyan"|"Magenta"|"DPurple"|"Purple"|"LPurple"|"White"|"LWhite"} ValidColor
 */

/**
 * Advanced Color Creator
 * @export
 * @class Color
 */
export class Color {
	/**
	 * @private
	 * @memberof Color
	 * Scroll to 8-Bit:
	 * https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
	 */
	static #ValidColors = {
		black:  16,
		lbrown: 130,
		dred: 52,
		red: 124,
		lred: 196,
		orange: 202,
		yellow: 226,
		lyellow: 229,
		dgreen: 22,
		green: 46,
		lgreen: 155,
		dblue: 17,
		blue: 63,
		lblue: 32,
		cyan: 30,
		lcyan: 122,
		magenta: 13,
		dpurple: 55,
		purple: 201,
		lpurple: 206,
		white: 188,
		lwhite: 231
	};

	static enum = {
		Black:  "black",
		LightBrown: "lbrown",
		DarkRed: "dred",
		Red: "red",
		LightRed: "lred",
		Orange: "orange",
		Yellow: "yellow",
		LightYellow: "lyellow",
		DarkGreen: "dgreen",
		Green: "green",
		LightGreen: "lgreen",
		DarkBlue: "dblue",
		Blue: "blue",
		LightBlue: "lblue",
		Cyan: "cyan",
		LightCyan: "lcyan",
		Magenta: "magenta",
		DarkPurple: "dpurple",
		Purple: "purple",
		LightPurple: "lpurple",
		White: "white",
		LightWhite: "lWhite"
	};



	/**
	 * @static
	 * @param {string} text
	 * @param {ValidColor} color
	 * @memberof Color
	 */
	static set(text, color){
		color = color.toLowerCase();
		if((this.#ValidColors[color] ?? null) === null) throw "That color is not supported!";
		return `\x1b[38;5;${this.#ValidColors[color]}m${text}\x1b[m`;
	}
}