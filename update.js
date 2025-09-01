import { green } from "/helpers/Functions.js";
/** @param {NS} ns */
export async function main(ns){
	try {
		if(ns.fileExists("/jsx/CopyButton.js")){
			ns.mv("home", "/jsx/CopyButton.js", "/jsx/CopyButton.jsx");
			ns.tprint(green("Updated Copy Button"));
		}
	} catch (e){
		return null;
	};

	try {
		if(ns.fileExists("/jsx/Colors.js")){
			ns.mv("home", "/jsx/Colors.js", "/jsx/Colors.jsx");
			ns.tprint(green("Updated Colors"));
		}
	} catch (e){
		return null;
	};

	try {
		if(ns.fileExists("/jsx/Timer.js")){
			ns.mv("home", "/jsx/Timer.js", "/jsx/Timer.jsx");
			ns.tprint(green("Updated Timer"));
		}
	} catch (e){
		return null;
	};

	try {
		if(ns.fileExists("/managers/batchingManager.js")){
			ns.mv("home", "/managers/batchingManager.js", "/managers/batchingManager.jsx");
			ns.tprint(green("Updated Batching Manager"));
		}
	} catch (e){
		return null;
	};

	try {
		if(ns.fileExists("/managers/serverManager.js")){
			ns.mv("home", "/managers/serverManager.js", "/managers/serverManager.jsx");
			ns.tprint(green("Updated Server Manager"));
		}
	} catch (e){
		return null;
	};

	try {
		if(ns.fileExists("/managers/targetManager.js")){
			ns.mv("home", "/managers/targetManager.js", "/managers/targetManager.jsx");
			ns.tprint(green("Updated Target Manager"));
		}
	} catch (e){
		return null;
	};
}