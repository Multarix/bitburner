import { numberConvert } from "/adv/extra/numberConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.print("Script Started");
	const newGame = ns.args[0];
	const target = ns.args[1];

	if (newGame === "false") newGame = false;

	const hackScript = `/scripts/hack.js`;
	const weakenScript = `/scripts/weaken.js`;
	const growScript = `/scripts/grow.js`;
	const numScript = `/adv/extra/numberConvert.js`;

	// Change all old servers to hack new place;
	for (const server of ns.getPurchasedServers()) {
		ns.killall(server);

		const serverRAM = ns.getServerMaxRam(server);
		const maxThreads = (serverRAM - 0.1) / 1.75;

		if (!newGame) {
			ns.print(`Starting scripts on ${server}`);
			ns.exec(weakenScript, server, maxThreads, "joesguns");
		}
	}

	const baseServerRAM = (newGame) ? 64 : 8192;
	let currentRAM = baseServerRAM; // Upgrade servers to higher RAM specs after server limit reached

	// Function to buy servers
	const buyServer = async (serverName, serverRAM, upgrade) => {
		ns.purchaseServer(serverName, serverRAM);
		await ns.sleep(500);
		await ns.scp([hackScript, weakenScript, growScript, numScript], serverName);

		if (!newGame) {
			const maxThreads = (serverRAM - 0.1) / 1.75;
			ns.exec(weakenScript, serverName, maxThreads, "joesguns");
		}

		ns.toast(`${(upgrade) ? "Upgraded" : "Bought"} a server | Hostname: ${serverName} | RAM: ${serverRAM}GB`, `${(upgrade) ? "info" : "success"}`, 15000);
		ns.print(`${(upgrade) ? "Upgraded" : "Bought"} a server | Hostname: ${serverName} | RAM: ${serverRAM}GB`);
	}

	// Function for finding the highest ram
	const highestRAMServer = () => {
		const serverObject = new Object();
		serverObject.highestRAM = currentRAM;
		serverObject.lastServer = 0;

		for (let i = 0; ns.getPurchasedServers().length > i; i++) {
			let serverMaxRAM = ns.getServerMaxRam(`hack-${i}`);
			if (serverMaxRAM >= serverObject.highestRAM) {
				serverObject.lastServer = i;
				serverObject.highestRAM = serverMaxRAM;
				currentRAM = serverObject.highestRAM;
			}
		}
		return serverObject;
	}

	// Buy servers
	const serverLimit = ns.getPurchasedServerLimit();
	let existingServers = ns.getPurchasedServers();
	ns.toast(`Purchased Servers: ${existingServers.length}/${serverLimit}`, "info", 5000);
	while (existingServers.length < serverLimit) {
		if (existingServers.length === serverLimit) break;
		const serverCost = ns.getPurchasedServerCost(currentRAM);

		let baseMulti = ns.getPurchasedServers().length * 0.2;
		let multiplier = (baseMulti < 1) ? 1 : baseMulti;

		const player = ns.getPlayer();
		let serverPrice = serverCost * multiplier;

		let purchased = false;
		if (player.money > serverPrice) {
			const newServer = `hack-${existingServers.length}`;
			await buyServer(newServer, currentRAM);
			purchased = true;
		}

		if (!purchased) {
			ns.print(`Missing money for server: $-${numberConvert(Math.round(ns.getPlayer().money - serverPrice) * -1)}`);
			await ns.sleep(10000);
		}
		existingServers = ns.getPurchasedServers();
	}

	// Upgrade Servers
	ns.print("All Servers bought, now upgrading Servers");
	const maxRAM = (newGame) ? 2048 : 8192;
	while (currentRAM <= maxRAM) {
		let serverObject = highestRAMServer();
		let serverStart = serverObject.lastServer;
		if (serverStart === (ns.getPurchasedServers().length - 1)) serverStart = -1;
		if (serverStart === -1) currentRAM = currentRAM * 2;
		if (serverStart === -1 && serverObject.highestRAM === maxRAM) break;
		if (serverObject.highestRAM > maxRAM) break;

		serverStart += 1;

		let i;
		for (i = serverStart; ns.getPurchasedServers().length > i; i++) {
			const serverCost = ns.getPurchasedServerCost(currentRAM);
			let hostName = `hack-${i}`;
			while ((serverCost + 10000000) > ns.getPlayer().money) {
				await ns.sleep(10000);
			}
			ns.killall(hostName);
			ns.deleteServer(hostName);
			await buyServer(hostName, currentRAM, true);
		}
	}

	// Hacking XP
	if (!newGame) {
		for (const server of ns.getPurchasedServers()) {
			const script = "/scripts/weaken.js";
			await ns.scp(script, server);

			const serverRAM = ns.getServerMaxRam(server) - 0.1;
			const scriptRAM = ns.getScriptRam(script);
			const maxThreads = serverRAM / scriptRAM;
			ns.exec(script, server, maxThreads, "joesguns");
		}
	}
	ns.toast(`All Servers upgraded!`, "success", 10000);

	ns.atExit(() => {
		if (target && target !== "exp") {
			if (!ns.scriptRunning("/adv/manageServers.js", "home")) {
				ns.exec("/adv/manageServers.js", "home", 1, target);
			}
		}
	});
}
