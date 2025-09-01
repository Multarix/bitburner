import { numberConvert, yellow, green } from "/helpers/Functions.js";

/**
 *
 * @param {number} level
 * @param {number} ram
 * @param {number} cores
 * @param {number} mult
 * @returns {number}
 */
function calculateMoneyGainRate(level, ram, cores, mult){
	const gainPerLevel = 1.5;

	const levelMult = level * gainPerLevel;
	const ramMult = Math.pow(1.035, ram - 1);
	const coresMult = (cores + 5) / 6;
	return levelMult * ramMult * coresMult * mult * 1;
}

/**
 * @typedef {Object} HackNet
 * @property {number} [core]
 * @property {number} cores
 * @property {number} ram
 * @property {number} level
*/

/**
 * @param {NS} ns
 * @param {String} type Should be `core`, `ram` or `level`
 * @param {HackNet} obj  An object that should contain the keys `cores`, `ram` and `level`
 **/
const nodeProduction = (ns, type, obj) => {
	if(type === "core") obj.cores += 1;
	if(type === "ram") obj.ram *= 2;
	if(type === "level") obj.level += 10;

	if(obj.cores > 16) obj.cores = 16;
	if(obj.ram > 64) obj.ram = 64;
	if(obj.level > 200) obj.level = 200;
	return (ns.fileExists("formulas.exe")) ? ns.formulas.hacknetNodes.moneyGainRate(obj.level, obj.ram, obj.cores, 1) : calculateMoneyGainRate(obj.level, obj.ram, obj.cores, 1);
};


/**
 * @param {Object} obj An object to loop through
 **/
const findBest = (obj) => { // Smaller is better
	const keys = Object.keys(obj);
	let best = keys[0];
	for(let i = 0; keys.length > i; i++){
		const k = keys[i];
		if(obj[k] < obj[best]) best = k;
	}
	return best;
};


/** @param {NS} ns **/
export async function main(ns){
	// ns.ui.openTail();
	ns.disableLog("ALL");
	ns.print("Script Started");

	const HACKNET_LIMIT = (ns.getServerMaxRam("home") > 4096) ? 24 : 6;
	while(ns.hacknet.numNodes() < HACKNET_LIMIT){
		let hackNodesMaxed = false;
		while(!hackNodesMaxed){
			const upgrade = new Object();
			upgrade.type = undefined;
			upgrade.cost = Infinity;
			upgrade.efficiency = Infinity;
			upgrade.node = 0;

			let i;
			hackNodesMaxed = true;
			for(i = 0; ns.hacknet.numNodes() > i; i++){
				const nodeStats = ns.hacknet.getNodeStats(i);
				if(!nodeStats){
					ns.print(yellow(`[WARN] Node ${i} doesn't exist!`));
					continue;
				}

				if(nodeStats.level === 200 && nodeStats.core === 16 && nodeStats.ram === 64) continue; // The node is maxed out
				if(hackNodesMaxed) hackNodesMaxed = false;
				const nodeEdited = Object.assign({}, nodeStats);

				const price = {
					"level": Infinity,
					"core": Infinity,
					"ram": Infinity
				};

				const upgradeEfficiency = new Object();

				const coreProduction = nodeProduction(ns, "core", nodeEdited);
				price.core = ns.hacknet.getCoreUpgradeCost(i, 1);
				upgradeEfficiency.core = price.core / coreProduction;

				const ramProduction = nodeProduction(ns, "ram", nodeEdited);
				price.ram = ns.hacknet.getRamUpgradeCost(i, 1);
				upgradeEfficiency.ram = price.ram / ramProduction;

				const levelProduction = nodeProduction(ns, "level", nodeEdited);
				price.level = ns.hacknet.getLevelUpgradeCost(i, 10);
				upgradeEfficiency.level = price.level / levelProduction;

				const best = findBest(upgradeEfficiency);
				const cost = price[best];
				const efficiency = upgradeEfficiency[best];

				if(efficiency < upgrade.efficiency){
					upgrade.type = best;
					upgrade.cost = cost;
					upgrade.efficiency = efficiency;
					upgrade.node = i;
				}
			}

			if(HACKNET_LIMIT > ns.hacknet.numNodes()){
				if(ns.hacknet.getPurchaseNodeCost() < upgrade.cost){
					upgrade.type = "server";
					upgrade.cost = ns.hacknet.getPurchaseNodeCost();
					upgrade.efficiency = -1;
					upgrade.node = -1;
					if(hackNodesMaxed) hackNodesMaxed = false;
				}
			}

			let bought = false;
			if(ns.getPlayer().money > upgrade.cost){
				let buyMessage = '';

				switch(upgrade.type){
					case "server":
						buyMessage = `Bought ${yellow("Hacknet-" + ns.hacknet.numNodes())} for ${green("$" + numberConvert(Math.ceil(upgrade.cost)))}`;
						bought = ns.hacknet.purchaseNode();
						break;

					case "ram":
						buyMessage = `Upgraded ${yellow("Hacknet-" + upgrade.node + "'s")} RAM for ${green("$" + numberConvert(Math.ceil(upgrade.cost)))}`;
						bought = ns.hacknet.upgradeRam(upgrade.node, 1);
						break;

					case "core":
						buyMessage = `Upgraded ${yellow("Hacknet-" + upgrade.node + "'s")}'s cores for ${green("$" + numberConvert(Math.ceil(upgrade.cost)))}`;
						bought = ns.hacknet.upgradeCore(upgrade.node, 1);
						break;

					case "level":
						buyMessage = `Upgraded ${yellow("Hacknet-" + upgrade.node + "'s")} level for ${green("$" + numberConvert(Math.ceil(upgrade.cost)))}`;
						bought = ns.hacknet.upgradeLevel(upgrade.node, 10);
						break;

					default: buyMessage = `Uh.. something broke`;
				}
				ns.print(buyMessage);
			}

			const sleepTime = (bought) ? 100 : 10000;
			await ns.sleep(sleepTime);
		}
	}
	ns.alert("Hacknodes Maxed");
}