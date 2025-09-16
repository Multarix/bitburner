import { Color } from "helpers/Functions";

/**
 * @typedef {Object} UpgradeData
 * @property {"server"|"ram"|"cores"|"level"|"cache"} [type]
 * @property {number} cost
 * @property {number} efficiency
 * @property {number} node
 */


/**
 * @param {NS} ns
 * @param {UpgradeData} nextUpgrade
 *
 * @example
 * ```javascript
 * [
 * 	" Hash Rate:         13.180h/s",
 * 	" Hash Stored:       1.536k / 1.536k",
 * 	" Nodes Purchased:   6/20"
 * 	" ",
 * 	" Next Upgrade:",
 * 	" Server-00 - Cores 15 -> 16 ($231.007m)",
 * 	" ",
 * 	" Server Information:"
 * 	" Server-00 - Lv: 100 | RAM: 256.00GB | Cores: 17 | Cache: 15 | 1.180h/s",
 * 	" Server-01 - Lv: 100 | RAM:  64.00GB | Cores:  8 | Cache:  5 | 1.180h/s",
 * 	" Server-02 - Lv: 100 | RAM: 256.00GB | Cores: 17 | Cache:  5 | 1.180h/s",
 * 	" Server-03 - Lv:  92 | RAM: 256.00GB | Cores: 17 | Cache:  5 | 1.180h/s",
 * 	" Server-04 - Lv:   8 | RAM: 256.00GB | Cores: 17 | Cache:  5 | 1.180h/s",
 * 	" Server-05 - Lv: 100 | RAM:   4.00GB | Cores: 17 | Cache:  5 | 1.180h/s"
 * ]
 *```
**/

function serverInfo(ns, nextUpgrade){
	const MAX_LEVEL = ns.formulas.hacknetServers.constants().MaxLevel;
	const currentHashes = ns.formatNumber(ns.hacknet.numHashes());
	const hashCapacity = ns.formatNumber(ns.hacknet.hashCapacity());

	const numberNodes = ns.hacknet.numNodes();
	const maxNodes = ns.hacknet.maxNumNodes();

	let longestLevel = 0;
	let longestRAM = 0;
	let longestCores = 0;
	let longestCache = 0;
	let longestHash = 0;

	const currentMultipliers = ns.getHacknetMultipliers();
	const productionMulti = currentMultipliers.production;

	const servers = [];
	let hashGainRate = 0;
	let totalProduction = 0;
	for(let i = 0; i < numberNodes; i++){
		const serverStats = ns.hacknet.getNodeStats(i);

		const level = serverStats.level;
		const ram = serverStats.ram;
		const cores = serverStats.cores;
		const cache = serverStats.hashCapacity;
		const hashRate = ns.formulas.hacknetServers.hashGainRate(level, 0, ram, cores, productionMulti);
		const index = i;

		const NodeStats = {
			level,
			ram,
			cores,
			cache,
			hashRate,
			index
		};

		servers.push(NodeStats);

		hashGainRate += hashRate;
		totalProduction += serverStats.totalProduction;

		longestLevel = Math.max(longestLevel, level.toString().length);
		longestRAM = Math.max(longestRAM, ns.formatRam(ram, 0).length);
		longestCores = Math.max(longestCores, cores.toString().length);
		longestCache = Math.max(longestCache, cache.toString().length);
		longestHash = Math.max(longestHash, hashRate.toFixed(3).length);
	}

	const sellHashCost = ns.hacknet.hashCost("Sell for Money");
	const income = (currentHashes === hashCapacity) ? Color.set("$" + ns.formatNumber((hashGainRate / sellHashCost) * 1000000), Color.preset.lime) : Color.set("$0", Color.preset.lime);

	const output = [];
	output.push(` Current Funds:     ${Color.set("$" + ns.formatNumber(ns.getPlayer().money), Color.preset.lime)}`);
	output.push(` Est. Income/sec:   ${income}`);
	output.push(` Hash Rate:         ${Color.set(hashGainRate.toFixed(3) + " H/s", Color.preset.pink)}`);
	output.push(` Hash Stored:       ${Color.set(currentHashes, Color.preset.lightYellow)} / ${Color.set(hashCapacity, Color.preset.green)}`);
	output.push(` Nodes Purchased:   ${Color.set(numberNodes, Color.preset.lightYellow)}/${Color.set(maxNodes, Color.preset.green)}`);
	output.push(" ");
	output.push(" Next Upgrade:");

	let nextUpgradeText = " N/A";

	if(nextUpgrade.node !== -1){
		try {
			const isReady = (nextUpgrade.cost <= ns.getPlayer().money) ? "✔️" : "❌";
			const moneyColor = (nextUpgrade.cost <= ns.getPlayer().money) ? Color.preset.lightGreen : Color.preset.lightRed;
			const serverName = Color.set(`Server-${nextUpgrade.node.toString().padStart(maxNodes.toString().length, "0")}`, Color.preset.lightBlue);
			const cost = Color.set("$" + ns.formatNumber(nextUpgrade.cost), moneyColor);
			switch(nextUpgrade?.type){
				case "cores": {
					const nodeInfo = ns.hacknet.getNodeStats(nextUpgrade.node);
					const currentCores = nodeInfo.cores;
					const nextCores = nodeInfo.cores + 1;

					nextUpgradeText = ` ${serverName} - Cores ${Color.set(currentCores, Color.preset.lightPurple)} ➜ ${Color.set(nextCores, Color.preset.orange)} (${cost}) ${isReady}`;
					break;
				}

				case "level": {
					const nodeInfo = ns.hacknet.getNodeStats(nextUpgrade.node);
					const currentLevel = nodeInfo.level;
					const nextLevel = Math.min(nodeInfo.level + 10, MAX_LEVEL);

					nextUpgradeText = ` ${serverName} - Level ${Color.set(currentLevel, Color.preset.lightPurple)} ➜ ${Color.set(nextLevel, Color.preset.orange)} (${cost}) ${isReady}`;
					break;
				}

				case "ram": {
					const nodeInfo = ns.hacknet.getNodeStats(nextUpgrade.node);
					const currentRAM = ns.formatRam(nodeInfo.ram, 0);
					const nextRAM = ns.formatRam(nodeInfo.ram * 2, 0);
					nextUpgradeText = ` ${serverName} - RAM ${Color.set(currentRAM, Color.preset.lightPurple)} ➜ ${Color.set(nextRAM, Color.preset.orange)} (${cost}) ${isReady}`;
					break;
				}

				case "cache": {
					const nodeInfo = ns.hacknet.getNodeStats(nextUpgrade.node);
					const currentCache = ns.formatNumber(nodeInfo.hashCapacity, 0);
					const nextCache = ns.formatNumber(nodeInfo.hashCapacity * 2, 0);
					nextUpgradeText = ` ${serverName} - RAM ${Color.set(currentCache, Color.preset.lightPurple)} ➜ ${Color.set(nextCache, Color.preset.orange)} (${cost}) ${isReady}`;
					break;
				}

				case "server": {
					nextUpgradeText = ` Buying ${serverName} (${cost}) ${isReady}`;
					break;
				}

				default: {
					nextUpgradeText = " N/A";
					break;
				}
			}

		} catch (e){
			nextUpgradeText = e;
		}
	}
	output.push(nextUpgradeText);

	output.push(" ");
	output.push(" Server Information:");
	for(const server of servers){
		const serverName = Color.set(`Server-${server.index.toString().padStart(maxNodes.toString().length, "0")}`, Color.preset.lightBlue);
		const level = Color.set(server.level.toString().padStart(longestLevel, " "), Color.preset.lightPurple);
		const ram = Color.set(ns.formatRam(server.ram, 0).padStart(longestRAM, " "), Color.preset.lightPurple);
		const cores = Color.set(server.cores.toString().padStart(longestCores, " "), Color.preset.lightPurple);
		const cache = Color.set(server.cache.toString().padStart(longestCache, " "), Color.preset.lightPurple);
		const hashRate = Color.set(server.hashRate.toFixed(3).padStart(longestHash, " ") + " H/s", Color.preset.pink);

		const line = ` ${serverName} - Lv: ${level} | RAM: ${ram} | Cores: ${cores} | Cache: ${cache} | ${hashRate}`;
		output.push(line);
	}

	return output;
}


/*
Valid Hash Purchases:
- Sell for Money
- Sell for Corporation Funds
- Reduce Minimum Security
- Increase Maximum Money
- Improve Studying
- Improve Gym Training
- Exchange for Corporation Research
- Exchange for Bladeburner Rank
- Exchange for Bladeburner SP
- Generate Coding Contract
- Company Favor
*/


/** @param {Object} obj An object to loop through */
const findBest = (obj) => { // Smaller is better
	const keys = Object.keys(obj);
	let best = keys[0];
	for(let i = 0; i < keys.length; i++){
		const k = keys[i];
		if(obj[k] < obj[best]) best = k;
	}
	return best;
};

/**
 * @param {NS} ns
 * @param {string} target
 **/
function spendHashes(ns, target){
	// const target = biggestTarget()

	// We know who we targeting...
	if(1 < ns.getServerMinSecurityLevel(target)){
		const weakenCost = ns.hacknet.hashCost("Reduce Minimum Security", 1);
		if(weakenCost < ns.hacknet.numHashes()){
			const spent = ns.hacknet.spendHashes("Reduce Minimum Security", "ecorp", 1);
			if(spent) ns.print(` Spent ${Color.set(weakenCost, Color.preset.lightBlue)} hashes to weaken ${Color.set(target, Color.preset.yellow)}`);
		}
	}

	if(ns.getServerMaxMoney(target) < 10000000000000){ // Should be 10 tril?
		const growCost = ns.hacknet.hashCost("Increase Maximum Money", 1);
		if(growCost < ns.hacknet.numHashes()){
			const spent = ns.hacknet.spendHashes("Increase Maximum Money", "ecorp", 1);
			if(spent) ns.print(` Spent ${Color.set(growCost, Color.preset.lightBlue)} hashes to grow ${Color.set(target, Color.preset.yellow)}`);
		}

		return;
	}

	const studyCost = ns.hacknet.hashCost("Improve Studying", 1);
	if(studyCost < ns.hacknet.numHashes()){
		const spent = ns.hacknet.spendHashes("Improve Studying", target, 1);
		if(spent) ns.print(` Spent ${Color.set(studyCost, Color.preset.lightBlue)} hashes to improve ${Color.set("studying", Color.preset.yellow)}`);
	}
}


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();
	ns.print(Color.set(" Script Started", Color.preset.lime));
	ns.ui.openTail();

	const BASE_HASH_PRODUCTION = 0.0013; // Hashes = money, more hashes = more money...
	// Max Level is 300
	const MAX_LEVEL = ns.formulas.hacknetServers.constants().MaxLevel;
	// Max RAM is 8192
	const MAX_RAM = ns.formulas.hacknetServers.constants().MaxRam;
	// Max Cores is 128
	const MAX_CORES = ns.formulas.hacknetServers.constants().MaxCores;
	// Changes depending on bitnode
	const MAX_NODES = ns.hacknet.maxNumNodes();

	const allNetworks = JSON.parse(ns.read("/helpers/servers.txt"));

	const serversArray = [];
	for(const server in allNetworks) serversArray.push({ name: allNetworks[server].name, money: allNetworks[server].maxMoney });
	const orderedServers = serversArray.sort((a, b) => b.money - a.money);
	const bestServer = orderedServers[0].name;

	const spend = spendHashes.bind(null, ns, bestServer);

	let serversMaxed = false;
	// const announced = false;
	while(!serversMaxed){
		ns.ui.resizeTail(600, 150);
		ns.ui.setTailTitle("\u200b Hacknet Manager - Upgrading");
		serversMaxed = true;
		const ownedNodes = ns.hacknet.numNodes();
		if(ownedNodes < MAX_NODES) serversMaxed = false;

		const toUpgrade = {
			type: undefined,
			cost: Infinity,
			efficiency: Infinity,
			node: -1
		};

		for(let i = 0; i < ownedNodes; i++){
			const hacknet = ns.hacknet.getNodeStats(i);
			if(hacknet.level === MAX_LEVEL && hacknet.cores === MAX_CORES && hacknet.ram === MAX_RAM) continue; // Maxed out already

			const upgradePrice = {
				level: Infinity,
				cores: Infinity,
				ram: Infinity
			};

			const upgradeEfficiency = {
				level: Infinity,
				cores: Infinity,
				ram: Infinity
			};

			const newLevel = Math.min(hacknet.level + 10, MAX_LEVEL);
			const newRAM = Math.min(hacknet.ram + 1, MAX_RAM);
			const newCores = Math.min(hacknet.cores * 2, MAX_CORES);

			const plusLevelProduction = ns.formulas.hacknetServers.hashGainRate(newLevel, 0, hacknet.ram, hacknet.cores, 1);
			upgradePrice.level = ns.hacknet.getLevelUpgradeCost(i, 10);
			upgradeEfficiency.level = upgradePrice.level / plusLevelProduction;

			const plusRamProduction = ns.formulas.hacknetServers.hashGainRate(hacknet.level, 0, newRAM, hacknet.cores, 1);
			upgradePrice.ram = ns.hacknet.getRamUpgradeCost(i, 1);
			upgradeEfficiency.ram = upgradePrice.ram / plusRamProduction;

			const plusCoresProduction = ns.formulas.hacknetServers.hashGainRate(hacknet.level, 0, hacknet.ram, newCores, 1);
			upgradePrice.cores = ns.hacknet.getCoreUpgradeCost(i, 1);
			upgradeEfficiency.cores = upgradePrice.cores / plusCoresProduction;

			const best = findBest(upgradeEfficiency);
			const cost = upgradePrice[best];
			const efficiency = upgradeEfficiency[best];

			if(efficiency < toUpgrade.efficiency){
				toUpgrade.type = best;
				toUpgrade.cost = cost;
				toUpgrade.efficiency = efficiency;
				toUpgrade.node = i;
			}
		}

		if(ns.hacknet.numNodes() < MAX_NODES){
			// If the cost of purchasing an upgrade is larger than buying a new node, but a new node
			if(ns.hacknet.getPurchaseNodeCost() < toUpgrade.cost){
				toUpgrade.type = "server";
				toUpgrade.cost = ns.hacknet.getPurchaseNodeCost();
				toUpgrade.efficiency = 0;
				toUpgrade.node = ownedNodes;
			}
		}

		serversMaxed = (toUpgrade.node === -1); // If no upgrades or server can be bought, clearly they're maxed... right? Hopefully?
		if(serversMaxed) break;

		const toPrint = serverInfo(ns, toUpgrade);
		ns.clearLog();
		for(const line of toPrint){
			ns.print(line);
		}

		ns.ui.setTailFontSize(14);
		ns.ui.resizeTail(680, 20 + (22 * toPrint.length));

		const money = ns.getPlayer().money;
		let boughtUpgrade = false;
		if(toUpgrade.cost < money){
			switch(toUpgrade.type){
				case "server": {
					boughtUpgrade = ns.hacknet.purchaseNode();
					break;
				}

				case "ram": {
					boughtUpgrade = ns.hacknet.upgradeRam(toUpgrade.node, 1);
					break;
				}

				case "cores": {
					boughtUpgrade = ns.hacknet.upgradeCore(toUpgrade.node, 1);
					break;
				}

				case "level": {
					boughtUpgrade = ns.hacknet.upgradeLevel(toUpgrade.node, 10);
					break;
				}
			}
		}

		await ns.sleep(1000);
	}

	let cachesMaxed = false;
	while(!cachesMaxed){
		cachesMaxed = true;
		const ownedNodes = ns.hacknet.numNodes();
		const toUpgrade = {
			type: "cache",
			cost: Infinity,
			efficiency: Infinity,
			node: -1
		};

		for(let i = 0; i < ownedNodes; i++){
			const upgradeCost = ns.hacknet.getCacheUpgradeCost(i, 1);
			if(upgradeCost < toUpgrade.cost){
				toUpgrade.node = i;
				toUpgrade.cost = upgradeCost;
			}
		}

		if(toUpgrade.node !== -1) cachesMaxed = false;
		if(cachesMaxed) break;

		const toPrint = serverInfo(ns, toUpgrade);
		ns.clearLog();
		for(const line of toPrint){
			ns.print(line);
		}

		ns.ui.setTailFontSize(14);
		ns.ui.resizeTail(680, 20 + (22 * toPrint.length));

		if(toUpgrade.cost < ns.getPlayer().money) ns.hacknet.upgradeCache(toUpgrade.node, 1);
	}

	ns.print(Color.set("Hacknet Servers Maxed!", Color.preset.pink));
	ns.toast("Hacknet Servers Maxed", "success", 10000);
	ns.ui.setTailTitle("\u200b Hacknet Manager - Spending");

	while(true){
		spend();

		const toPrint = serverInfo(ns);
		ns.clearLog();
		for(const line of toPrint){
			ns.print(line);
		}

		await ns.sleep(100);
	}
}