import { numberConvert, getMaxPorts } from "/helpers/Functions.js";
import { Colors } from "jsx/Colors";


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	ns.ui.openTail();
	ns.ui.resizeTail(600, 150);
	const [winX, winY] = ns.ui.windowSize();
	ns.ui.moveTail(winX - 820, 100);
	ns.ui.setTailTitle(<Colors color="white"> Target Manager - Starting</Colors>);


	ns.scriptKill("/managers/serverManager.jsx", "home");
	let serverManagerID = 0;

	const target = {
		name: "foodnstuff",
		hackLevel: ns.getServerRequiredHackingLevel("foodnstuff"),
		ports: ns.getServerNumPortsRequired("foodnstuff"),
		maxMoney: ns.getServerMaxMoney("foodnstuff"),
		prev: ""
	};

	ns.clearPort(20);
	ns.writePort(20, target.name);

	const allNetworks = JSON.parse(ns.read("/helpers/servers.txt"));

	const serversArray = [];
	for(const server in allNetworks) serversArray.push({ name: allNetworks[server].name, money: allNetworks[server].maxMoney });
	const orderedServers = serversArray.sort((a, b) => b.money - a.money);
	const bestServer = orderedServers[0].name;

	ns.printRaw(<Colors color="lime">Script Starting!</Colors>);
	while(true){
		await ns.sleep(1000);
		try {
			if(serverManagerID === 0) ns.printRaw(<Colors color="white"> Initializing...</Colors>);
			if(serverManagerID) await ns.sleep(4000);

			// const oldHackLevel = await hackingLevelUpdate(ns);
			const hackingLevel = ns.getHackingLevel();
			// ns.print(`${white("Hacking leveled up:")} ${yellow(oldHackLevel)} ${white("=>")} ${yellow(hackingLevel)}`);

			let newTarget = false;
			const maxPorts = getMaxPorts(ns);
			for(const server in allNetworks){ // Check if we have a new good target.
				// ns.print(`[Debug] Checking ${server}...`);

				if(allNetworks[server].name === "home") continue;
				if(allNetworks[server].name.startsWith("hack-")) continue;
				if(allNetworks[server].name.startsWith("hacknet-server")) continue;
				if(allNetworks[server].name === target.name) continue;
				if(allNetworks[server].name === target.prev) continue;
				if(allNetworks[server].ports > maxPorts) continue;
				if(allNetworks[server].hackLevel > hackingLevel) continue;

				if(target.maxMoney >= allNetworks[server].maxMoney) continue;
				if(ns.getServerGrowth(server) === 0) continue;

				// Target is good to go
				target.prev = target.name;
				target.name = allNetworks[server].name;
				target.ports = allNetworks[server].ports;
				target.hackLevel = allNetworks[server].hackLevel;
				target.maxMoney = allNetworks[server].maxMoney;
				newTarget = true;
			};


			if(newTarget){ // We now have a new target
				ns.toast(`New target: ${target.name} | Ports: ${target.ports} | Money: $${numberConvert(target.maxMoney)}`, "info", 15000);
				ns.printRaw(<Colors color="white"> New target: <Colors color="yellow">{target.name}</Colors> | Ports: <Colors color="magenta">{target.ports}</Colors> | Money: <Colors color="lime">{"$" + numberConvert(target.maxMoney)}</Colors></Colors>);
				ns.ui.setTailTitle(<Colors color="white"> Target Manager | {target.name} - ${numberConvert(target.maxMoney)}</Colors>);

				ns.clearPort(20);
				ns.writePort(20, target.name);
			}

			if(!serverManagerID){
				ns.printRaw(<Colors color="white"> Starting Server Manager...</Colors>);
				serverManagerID = ns.run("/managers/serverManager.jsx", 1, target.name);

				// ns.run("/managers/goManager.js", { threads: 1, preventDuplicates: true }); // This uses a bunch of RAM for not much gain, so we start it after literally everything else could be.
			}

			if(target.name === bestServer){
				ns.printRaw(<Colors color="red"> Best server found, stopping target manager!</Colors>);
				await ns.sleep(10000);
				ns.ui.closeTail();
				ns.exit();
			}

		} catch (e){
			ns.tprint(e);
		}
	}
};
