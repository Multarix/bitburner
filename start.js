import { timeConvert, gainRoot, white, scanNetworks } from "/helpers/Functions.js";

const theme = {
	"primarylight": "#FFFFFF",
	"primary": "#FFFFFF",
	"primarydark": "#BBBBBB",
	"successlight": "#0f0",
	"success": "#0c0",
	"successdark": "#090",
	"errorlight": "#f00",
	"error": "#c00",
	"errordark": "#900",
	"secondarylight": "#AAA",
	"secondary": "#AAFFAE",
	"secondarydark": "#666",
	"warninglight": "#ff0",
	"warning": "#cc0",
	"warningdark": "#990",
	"infolight": "#69f",
	"info": "#36c",
	"infodark": "#039",
	"welllight": "#444",
	"well": "#222222",
	"white": "#fff",
	"black": "#000000",
	"hp": "#dd3434",
	"money": "#ffd700",
	"hack": "#adff2f",
	"combat": "#faffdf",
	"cha": "#a671d1",
	"int": "#6495ed",
	"rep": "#faffdf",
	"disabled": "#CF6565",
	"backgroundprimary": "#000000",
	"backgroundsecondary": "#181818",
	"button": "#333333",
	"maplocation": "#ffffff",
	"bnlvl0": "#ffff00",
	"bnlvl1": "#ff0000",
	"bnlvl2": "#48d1cc",
	"bnlvl3": "#0000ff"
};

/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();
	ns.ui.setTheme(theme);

	const allNetworks = scanNetworks(ns, "home", true);

	const serverList = "/helpers/servers.txt";
	ns.clear(serverList);
	ns.write(serverList, JSON.stringify(allNetworks, null, "\t"), "w");

	const homeRAM = ns.getServerMaxRam('home');

	// Initial Run, hacks foodnstuff with the maximum possible threads to get xp.
	const bigHack = (ns.getHackingLevel() <= 20);
	if(bigHack){
		const money = ns.getPlayer().money;
		if(money > 210000 && !ns.hasTorRouter()){
			ns.run("/helpers/startHelper.js", 1, true);
			await ns.sleep(1000);
		} else {
			ns.run("/helpers/startHelper.js", 1, false);
			await ns.sleep(1000);
		}

		gainRoot(ns, "foodnstuff");
		await ns.sleep(500);

		const waitTime = ns.getWeakenTime("foodnstuff");
		const maxThreads = Math.floor((homeRAM - 16) / ns.getScriptRam("/scripts/single/weaken.js"));
		ns.run("/scripts/single/weaken.js", maxThreads, "foodnstuff");
		ns.print(`Doing mass weaken for exp | ETA: ${white(timeConvert(waitTime + 2000))}`);

		await ns.sleep(waitTime + 5000);
	}


	ns.scriptKill("/managers/goManager.js", "home");
	ns.scriptKill("/managers/hacknetManager.js", "home");
	ns.scriptKill("/managers/stockManager.js", "home");
	ns.scriptKill("/managers/selfhackManager.js", "home");
	ns.scriptKill("managers/gangManager.js", "home");
	ns.scriptKill("/managers/manageServers.jsx", "home");
	ns.scriptKill("/managers/buyServer.js", "home");
	ns.scriptKill("/managers/targetManager.jsx", "home");
	ns.scriptKill("/managers/autoBuyer.js", "home");


	ns.toast("Starting scripts!", "info", 10000);
	ns.run("/managers/selfhackManager.js");
	ns.print(`Selfhack Manager Started`, "info");


	// Even without formulas.exe, we can start the hacknet manager... but only if we pass an arg to the script
	const runHacknetManager = await ns.prompt("Start the Hacknet Manager?", { type: "boolean" });
	if(runHacknetManager){
		ns.exec("/managers/hacknetManager.js", "home", { threads: 1, preventDuplicates: true });
		ns.toast("Hacknet manager was started", "info");
	}


	if(ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess() && ns.stock.has4SDataTIXAPI()){
		const runStockManager = await ns.prompt("Run Stockmarket Manager?", { type: "boolean" });
		if(runStockManager){
			ns.exec("/managers/stockManager.js", "home", { threads: 1, preventDuplicates: true });
			ns.toast("Stockmarket manager was started!");
		}
	}

	ns.exec("/managers/buyServer.js", "home", { threads: 1, preventDuplicates: true });
	ns.exec("/managers/sleeveManager.js", "home", { threads: 1, preventDuplicates: true });
	ns.exec("/managers/autoBuyer.js", "home", { threads: 1, preventDuplicates: true }); // Uses singularity.

	if(ns.gang.inGang()){
		ns.exec("managers/gangManager.js", "home", { threads: 1, preventDuplicates: true });
		ns.toast("Gang manager was started", "info");
	}

	if(ns.sleeve.getNumSleeves() > 0){ // Kinda hefty to start, ~64GB RAM
		ns.exec("managers/sleeveManager.js", "home", { threads: 1, preventDuplicates: true });
		ns.toast("Sleeve manager was started", "info");
	}

	// This might fix an ongoing bug...
	// ns.mv("home", "/managers/targetManager.jsx", "/managers/targetManager.js");
	// ns.mv("home", "/managers/targetManager.js", "/managers/targetManager.jsx");
	ns.exec("/managers/targetManager.jsx", "home", { threads: 1, preventDuplicates: true });
}