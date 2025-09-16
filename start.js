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
	ns.writePort(1, false);

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

		ns.run("/helpers/startHelper2.js", 1);
		await ns.sleep(1000);

		gainRoot(ns, "foodnstuff");
		await ns.sleep(1000);

		const thisScriptRam = ns.getScriptRam("/start.js");
		const waitTime = ns.getWeakenTime("foodnstuff");
		const maxThreads = Math.floor((homeRAM - thisScriptRam) / ns.getScriptRam("/scripts/single/weaken.js"));
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
	ns.toast(`Selfhack Manager Started`, "info", 10000);

	const targetManager = ns.exec("/managers/targetManager.jsx", "home", { threads: 1, preventDuplicates: true });
	if(homeRAM < 64){ // We have 32GB
		while(!ns.peek(2)){
			await ns.sleep(1000);
		}
		ns.kill(targetManager);
	};

	ns.exec("/managers/buyServer.js", "home", { threads: 1, preventDuplicates: true });
	ns.exec("/managers/autoBuyer.js", "home", { threads: 1, preventDuplicates: true }); // ~38GB

	if(homeRAM < 128) return; // We have 64GB or less, don't start any more

	ns.exec("managers/sleeveManager.js", "home", { threads: 1, preventDuplicates: true }); // ~64GB RAM
	ns.toast("Sleeve manager was started", "info");

	if(homeRAM < 256) return; // We have 128GB, don't start any more
	if(ns.gang.inGang()){
		ns.exec("managers/gangManager.js", "home", { threads: 1, preventDuplicates: true });
		ns.toast("Gang manager was started", "info");
	}

	ns.exec("/managers/factionManager.js", "home", { threads: 1, preventDuplicates: true }); // ~12GB

	// Even without formulas.exe, we can start the hacknet manager...But honestly I doubt we care
	const runHacknetManager = await ns.prompt("Start the Hacknet Manager?", { type: "boolean" });
	if(runHacknetManager){
		ns.exec("/managers/hacknetServerManager.js", "home", { threads: 1, preventDuplicates: true });
		ns.toast("Hacknet manager was started", "info");
	}


	if(ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess() && ns.stock.has4SDataTIXAPI()){
		const runStockManager = await ns.prompt("Run Stockmarket Manager?", { type: "boolean" });
		if(runStockManager){
			ns.exec("/managers/stockManager.js", "home", { threads: 1, preventDuplicates: true });
			ns.toast("Stockmarket manager was started!");
		}
	}
}