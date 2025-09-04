import { green, getMaxPorts, numberConvert, scanNetworks, Color, progressBar, FiraCodeLoading } from "helpers/Functions";

/** @param {NS} ns **/
function deploy(ns){
	const hackScript = `/scripts/single/hack.js`;
	const weakenScript = `/scripts/single/weaken.js`;
	const weakenScriptRepeat = `/scripts/repeat/weaken.js`;
	const growScript = `/scripts/single/grow.js`;
	const functionScript = `/helpers/Functions.js`;
	const shareRAM = `/scripts/repeat/share.js`;
	const shareManager = "/managers/shareManager.js";

	const servers = ns.getPurchasedServers();
	const serverJSON = JSON.parse(ns.read("/helpers/servers.txt"));

	for(const server in serverJSON){
		servers.push(server);
	}

	// ns.print(servers);

	for(const server of servers){
		if(server === "home") continue;
		ns.killall(server);

		ns.scp([hackScript, weakenScript, weakenScriptRepeat, growScript, functionScript, shareRAM, shareManager], server);
		ns.print(`Copied the files to ${server}!`);
	}
}


/** @param {NS} ns **/
function share(ns){
	ns.ui.closeTail();

	deploy(ns);
	const servers = ns.getPurchasedServers();
	const serverJSON = JSON.parse(ns.read("/helpers/servers.txt"));

	for(const server in serverJSON){
		servers.push(server);
	}

	for(const server of servers){
		ns.killall(server);
		ns.exec("/managers/shareManager.js", server);
	}

}


/** @param {NS} ns **/
function xp(ns){
	ns.ui.closeTail();

	deploy(ns);
	const servers = ns.getPurchasedServers();
	const serverJSON = JSON.parse(ns.read("/helpers/servers.txt"));

	for(const server in serverJSON){
		servers.push(server);
	}

	for(const server of servers){
		const ram = ns.getServerMaxRam(server);
		const maxThreads = (ram - 0.1) / ns.getScriptRam("/scripts/repeat/weaken.js", server);

		ns.killall(server);
		ns.print(`Setting ${server} to gain xp!`);
		ns.exec("/scripts/repeat/weaken.js", server, Math.max(Math.floor(maxThreads), 1), "foodnstuff");
	}

}


/** @param {NS} ns **/
function batch(ns, minMoney){
	if(!minMoney) return ns.print("Arg2 was not specified!");
	const money = parseInt(minMoney);
	if(isNaN(money)) return ns.print("Arg2 was not a number!");
	const portsAvailable = getMaxPorts(ns);

	const servers = JSON.parse(ns.read("/helpers/servers.txt"));

	// ns.print(`Hackable servers with more than $${green(numberConvert(money))}:`);
	const goodServers = [];
	ns.ui.setTailTitle(`Servers with more than $${numberConvert(money)}`);
	for(const serverName in servers){
		const server = servers[serverName];
		const skilledEnough = server.hackLevel <= ns.getHackingLevel();

		if(server.maxMoney > money){
			if(skilledEnough && server.ports <= portsAvailable){
				goodServers.push(server);
			}
		}
	}

	goodServers.sort((a, b) => a.maxMoney - b.maxMoney);
	for(const server of goodServers){
		ns.print(`REQ LVL: ${green(server.hackLevel)} | $${green(numberConvert(server.maxMoney))} | MIN SEC: ${green(ns.getServerMinSecurityLevel(server.name))} - ${server.name}`);
	}
}


/** @param {NS} ns **/
function pos(ns){
	ns.ui.resizeTail(800, 82);
	const [winX, winY] = ns.ui.windowSize();
	const pos = ns.args[1] || 0;
	ns.ui.moveTail(250, (winY - 100) - (82 * (pos + 1))); // Bottom Left Corner
	ns.print("One");
	ns.print("Two");
	ns.print("Three");
}


/** @param {NS} ns **/
function crimes(ns){
	ns.ui.closeTail();

	const crimeTypes = ns.enums.CrimeType;
	const crimes = [
		crimeTypes.assassination,
		crimeTypes.bondForgery,
		crimeTypes.grandTheftAuto,
		crimeTypes.heist,
		crimeTypes.homicide,
		crimeTypes.kidnap,
		crimeTypes.larceny,
		crimeTypes.mug,
		crimeTypes.robStore,
		crimeTypes.shoplift,
		crimeTypes.traffickArms
	];

	for(const crime of crimes){
		const gains = ns.formulas.work.crimeGains(ns.getPlayer(), crime);
		// const x = ns.singularity.getCrimeStats;
	}
}


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.ui.openTail();

	const argument = ns.args[0];
	if(argument === "deploy") deploy(ns);
	if(argument === "share") share(ns);
	if(argument === "batch" || argument === "money") batch(ns, ns.args[1]);
	if(argument === "pos") pos(ns);
	if(argument === "xp") xp(ns);
	if(argument === "scan") ns.print(scanNetworks(ns, "home", true));
	if(argument === "crime") crimes(ns);

	if(argument === "stock"){
		ns.ui.closeTail();
		const isSelling = (ns.peek(11) === 1);

		ns.clearPort(11);
		ns.writePort(11, Number(!isSelling));

		const action = isSelling ? "BUY" : "SELL";
		const textColor = isSelling ? Color.preset.red : Color.preset.green;
		ns.tprint(`${Color.set("Setting stock manager to", Color.preset.yellow)} ${Color.set(action, textColor)}`);
	}

	if(argument === "player"){
		const player = ns.getPlayer();
		const killed = player.numPeopleKilled;
		const karma = player.karma;
		const entropy = player.entropy;

		ns.tprint(`Killed: ${killed} | Karma: ${karma} | Entropy: ${entropy}`);
		ns.ui.closeTail();
	}

	ns.clearLog();
	const bar1 = progressBar(0.1, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.1";
	const bar2 = progressBar(0.2, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.2";
	const bar3 = progressBar(0.3, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.3";
	const bar4 = progressBar(0.4, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.4";
	const bar5 = progressBar(0.5, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.5";
	const bar6 = progressBar(0.6, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.6";
	const bar7 = progressBar(0.7, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.7";
	const bar8 = progressBar(0.8, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.8";
	const bar9 = progressBar(0.9, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 0.9";
	const bar10 = progressBar(1, FiraCodeLoading.filled, FiraCodeLoading.empty) + " 1";
	ns.print(bar1);
	ns.print(bar2);
	ns.print(bar3);
	ns.print(bar4);
	ns.print(bar5);
	ns.print(bar6);
	ns.print(bar7);
	ns.print(bar8);
	ns.print(bar9);
	ns.print(bar10);
}