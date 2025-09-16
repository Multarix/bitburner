import { numberConvert, yellow, green, red, magenta } from "/helpers/Functions.js";


function sortServers(a, b){
	const aNumber = parseInt(a.split("-")[1]);
	const bNumber = parseInt(b.split("-")[1]);

	return aNumber - bNumber;
}


/** @param {NS} ns **/
function highestRAMServer(ns){
	const servers = ns.getPurchasedServers().sort(sortServers);

	const serverObj = {
		name: "",
		ram: 0
	};

	for(const server of servers){
		const serverRAM = ns.getServerMaxRam(server);
		if(serverRAM >= serverObj.ram){
			serverObj.name = server;
			serverObj.ram = serverRAM;
		}
	}

	return serverObj;
}


// Function to buy servers
/** @param {NS} ns **/
async function buyServerBind(ns, serverName, serverRAM, upgrade){
	const name = ns.purchaseServer(serverName, serverRAM);
	if(!name) return;

	const cost = ns.getPurchasedServerCost(serverRAM);

	const hackScript = `/scripts/single/hack.js`;
	const weakenScript = `/scripts/single/weaken.js`;
	const weakenScriptRepeat = `/scripts/repeat/weaken.js`;
	const growScript = `/scripts/single/grow.js`;
	const helperScript = `/helpers/Functions.js`;
	const shareRAM = `/scripts/repeat/share.js`;
	const shareManager = "/managers/shareManager.js";
	const batchingManager = '/managers/batchingManager.jsx';
	const colors = "/jsx/Colors.jsx";
	const timer = "/jsx/Timer.jsx";

	ns.scp([hackScript, weakenScript, weakenScriptRepeat, growScript, helperScript, shareRAM, shareManager, batchingManager, colors, timer], serverName);

	ns.toast(` ${(upgrade) ? "Upgraded" : "Bought"} a server for $${numberConvert(cost)} | Hostname: ${name} | RAM: ${serverRAM}GB `, `${(upgrade) ? "info" : "success"}`, 15000);
	ns.print(` ${(upgrade) ? "Upgraded" : "Bought"} a server for $${numberConvert(cost)} | Hostname: ${yellow(name)} | RAM: ${yellow(serverRAM)}GB`);
}


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();
	// ns.ui.openTail();

	const buyServer = buyServerBind.bind(null, ns);
	ns.ui.setTailTitle(`\u200b Server Buyer | Starting`);

	ns.print(`${green(" Starting Script!")}`);
	const newGame = (ns.getServerMaxRam("home") < 16384);

	// Min ram of servers bought should be at least half of what home is
	const baseServerRAM = (newGame) ? ns.getServerMaxRam("home") / 2 : 8192;
	let currentRAM = baseServerRAM; // Upgrade servers to higher RAM specs after server limit reached

	// Buy servers
	const serverLimit = ns.getPurchasedServerLimit();
	if(!serverLimit) return ns.spawn("/managers/hacknetServerManager.js", { threads: 1, preventDuplicates: true, spawnDelay: 500 }); // Can't buy regular servers...
	ns.toast(`Purchased Servers: ${ns.getPurchasedServers().length}/${serverLimit}`, "info", 5000);
	while(ns.getPurchasedServers().length < serverLimit){
		const serversBought = ns.getPurchasedServers().length;
		if(serversBought === serverLimit) break;

		const serverCost = ns.getPurchasedServerCost(currentRAM);

		const player = ns.getPlayer();
		const serverPrice = serverCost * 1.2;

		if(player.money > serverPrice){
			const newServer = `hack-${serversBought}`;
			await buyServer(newServer, currentRAM);
			continue;
		}

		ns.print(` Missing money for server: ${red("$" + numberConvert(Math.round(ns.getPlayer().money - serverPrice) * -1))}`);
		ns.ui.setTailTitle(`\u200b Buying ➜ ${serversBought}/${serverLimit}`);
		await ns.sleep(10000);
	}

	ns.print(`${magenta(' All Servers bought, now upgrading Servers')}`);

	// Upgrade Servers
	const maxRAM = (newGame) ? 2048 : 8192;
	currentRAM *= 2;
	while(currentRAM <= maxRAM){
		const lastServerUpgraded = highestRAMServer(ns);
		if(lastServerUpgraded.ram === maxRAM && lastServerUpgraded.name === `hack-${serverLimit - 1}`) break; // All servers are as upgraded as we should take em
		if(lastServerUpgraded.ram > currentRAM) currentRAM = lastServerUpgraded.ram;
		if(lastServerUpgraded.ram === currentRAM && lastServerUpgraded.name === `hack-${serverLimit - 1}`){	// All servers are upgraded to the current RAM level, move to next.
			currentRAM *= 2;
			continue;
		}

		const serverNumber = parseInt(lastServerUpgraded.name.split("-")[1]);
		const nextServer = `hack-${(serverNumber + 1) % serverLimit}`;
		const serverCost = ns.getPurchasedServerCost(currentRAM);

		ns.ui.setTailTitle(`\u200b Upgrading ${(serverNumber + 1) % serverLimit}/${serverLimit} ➜ ${currentRAM}GB ($${numberConvert(serverCost)})`);

		// While we don't have the money,
		// Or there is a script currently running on the server (part of a grow/weaken/hack/weaken or share cycle), sleep.
		while(serverCost * 1.2 > ns.getPlayer().money || ns.ps(nextServer).length > 0){
			await ns.sleep(1000);
		}

		ns.deleteServer(nextServer);
		await buyServer(nextServer, currentRAM, true);
	}

	ns.toast(` All Servers upgraded!`, "success", 10000);
}