import { timeConvert } from "/adv/extra/timeConvert.js";
import { numberConvert } from "/adv/extra/numberConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.print("Starting Script");

	const allNetworks = new Object();
	function scanNetworks(hostName) {
		const scanResults = ns.scan(hostName); // Scan the server;

		for (const host of scanResults) {
			if (allNetworks[host]) continue;
			if (host === "home") continue
			allNetworks[host] = new Object();
			allNetworks[host].name = host;
			allNetworks[host].hackLevel = ns.getServerRequiredHackingLevel(host);
			allNetworks[host].ports = ns.getServerNumPortsRequired(host);
			allNetworks[host].maxMoney = ns.getServerMaxMoney(host);

			scanNetworks(host);
		}
	}
	scanNetworks("home");

	const serverList = "/adv/servers.txt";
	await ns.write(serverList, JSON.stringify(allNetworks, null, "\t"), "w");

	const homeRAM = ns.getServerMaxRam('home');

	const bigHack = (ns.getHackingLevel() <= 10) ? true : false;
	if (bigHack && 20 > ns.getHackingLevel()) {
		ns.run("/adv/extra/rootAccess.js", 1, "foodnstuff");
		await ns.sleep(500);
		const waitTime = ns.getWeakenTime("foodnstuff");
		const maxThreads = (homeRAM - 8) / ns.getScriptRam("/scripts/optimal/weaken.js");
		ns.run("/scripts/optimal/weaken.js", maxThreads, "foodnstuff");
		ns.print(`Doing mass weaken for exp | ETA: ${timeConvert(waitTime + 2000)}`);
		await ns.sleep(waitTime + 2000);
	}

	const newGame = (homeRAM <= 16384) ? true : false;

	ns.scriptKill("hacknet.js", "home");
	ns.scriptKill("stockmarket.js", "home");
	ns.scriptKill("/adv/newGame.js", "home");
	ns.scriptKill("/adv/autoNuke.js", "home");
	ns.scriptKill("/adv/buyServer.js", "home");

	ns.toast("Starting scripts!", "info", 10000);
	if (newGame) {
		ns.run("/adv/newGame.js");
		ns.print("- New game script was started");
	} else {
		ns.run("/adv/autoNuke.js")
		ns.print("- AutoNuke script was started");

		ns.run("/adv/buyServer.js", 1, false, "exp");
		ns.print("- Buyserver script was started for EXP");
	}

	// ns.print(`Home server has ${homeRAM}GB of RAM`);
	if (homeRAM <= 2048) {
		ns.run("hacknet.js", 1, newGame); // Startup hacknet script
		ns.print("- Hacknet script was started");
	} else {
		ns.run("stockmarket.js", 1); // Startup stockmarket script
		ns.print("- Stockmarket script was started");
	}
	if (homeRAM < 32) return;

	let ports = 0;
	const portCheck = async () => {
		ports = 0;
		if (ns.fileExists("brutessh.exe", "home")) ports++
		if (ns.fileExists("ftpcrack.exe", "home")) ports++
		if (ns.fileExists("httpworm.exe", "home")) ports++
		if (ns.fileExists("relaysmtp.exe", "home")) ports++
		if (ns.fileExists("sqlinject.exe", "home")) ports++
		return ports;
	}

	const hackingLevelUpdate = async () => {
		const player = ns.getPlayer();
		const oldHackLevel = Object.assign({}, player);

		let currentHackLevel = oldHackLevel.hacking;

		while (currentHackLevel === oldHackLevel.hacking) {
			currentHackLevel = ns.getPlayer().hacking;
			await ns.sleep(5000);
			// hacking level not updated
		}
		return oldHackLevel.hacking;
	};

	const currentTarget = new Object();
	currentTarget.name = "";
	currentTarget.hackLevel = 0;
	currentTarget.ports = 0;
	currentTarget.maxMoney = 0;
	currentTarget.prev = "";

	let newTarget = false;
	const serverCheck = async (bypass) => {
		let hackingLevel = ns.getPlayer().hacking;
		if (!bypass) {
			const oldHackLevel = await hackingLevelUpdate();
			hackingLevel = ns.getPlayer().hacking;
			ns.print(`Hacking leveled up: ${oldHackLevel} => ${hackingLevel}`);
		}

		newTarget = false;

		let curTargBackup = currentTarget.name;
		for (const server in allNetworks) {
			const maxPorts = await portCheck();

			if (allNetworks[server].name === currentTarget.name) continue
			if (allNetworks[server].name === "home") continue;
			if (allNetworks[server].ports > maxPorts) continue;
			if (allNetworks[server].hackLevel > hackingLevel) continue;

			if (currentTarget.maxMoney >= allNetworks[server].maxMoney) continue;
			if (ns.getServerGrowth(allNetworks[server].name) === 0) continue;

			currentTarget.name = allNetworks[server].name;
			currentTarget.ports = allNetworks[server].ports;
			currentTarget.hackLevel = allNetworks[server].hackLevel;
			currentTarget.maxMoney = allNetworks[server].maxMoney;
			newTarget = true;
			// UPGRADE: Create array of all servers that are hackable, organise them and select best one;
			// ns.print(`Found Potential Target: ${currentTarget.name} | Ports: ${currentTarget.ports} | Level: ${currentTarget.hackLevel} | Money: $${currentTarget.maxMoney.toLocaleString()}`)
		};

		if (newTarget) {
			ns.toast(`New target: ${currentTarget.name} | Ports: ${currentTarget.ports} | Money: $${numberConvert(currentTarget.maxMoney)}`, "info", 15000);
			ns.print(`New target: ${currentTarget.name} | Ports: ${currentTarget.ports} | Money: $${numberConvert(currentTarget.maxMoney)}`);
			currentTarget.prev = curTargBackup;


			ns.scriptKill("/adv/manageServers.js", "home");
			if (homeRAM <= 8196) {
				ns.scriptKill("/adv/buyServer.js", "home");
				ns.run("/adv/buyServer.js", 1, newGame, currentTarget.name);
				await ns.sleep(1000);
				ns.run("/adv/manageServers.js", 1, currentTarget.name);
			} else {
				ns.scriptKill("/adv/optimal.js", "home");
				ns.scriptKill("/adv/spawnOptimal.js", "home");
				ns.scriptKill("/adv/extra/waitScript.js", "home");
				ns.scriptKill("/scripts/optimal/hack.js", "home");
				ns.scriptKill("/scripts/optimal/grow.js", "home");
				ns.scriptKill("/scripts/optimal/weaken.js", "home");

				ns.run("/adv/optimal.js", 1, currentTarget.name);

			}
		}
		// if (currentTarget.name === "fulcrumasets") return;
		await serverCheck(false);
	};
	await serverCheck(true);
}
