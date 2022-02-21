/** @param {NS} ns **/
import { numberConvert } from "/adv/extra/numberConvert.js";
export async function main(ns) {
	ns.disableLog("ALL");
	ns.print("Script Started");
	const newGame = ns.args[0];

	/**
	 * @param type {String} Should be `core`, `ram` or `level`
	 * @param obj {JSON} An object that should contain the keys `core`, `ram` and `level`
	**/
	const nodeProduction = (type, obj) => {
		if (type === "core") obj.core += 1;
		if (type === "ram") obj.ram *= 2;
		if (type === "level") obj.level += 10;

		if (obj.core > 16) obj.core = 16;
		if (obj.ram > 64) obj.ram = 64;
		if (obj.level > 200) obj.level = 200;
		return ns.formulas.hacknetNodes.moneyGainRate(obj.level, obj.ram, obj.cores, 1)
	};

	/**
	 * @param obj {JSON} An object to loop through
	**/
	const findBest = (obj) => { // Smaller is better
		const keys = Object.keys(obj);
		let best = keys[0];
		for (let i = 0; keys.length > i; i++) {
			const k = keys[i];
			if (obj[k] < obj[best]) best = k;
		}
		return best;
	}

	const hackNetLimit = (newGame) ? 12 : 24;
	while (ns.hacknet.numNodes() < hackNetLimit) {
		let hackNodesMaxed = false;
		while (!hackNodesMaxed) {
			const upgrade = new Object();
			upgrade.type = undefined;
			upgrade.cost = Infinity;
			upgrade.efficiency = Infinity;
			upgrade.node = 0;

			let i;
			hackNodesMaxed = true;
			for (i = 0; ns.hacknet.numNodes() > i; i++) {
				const nodeStats = ns.hacknet.getNodeStats(i);
				if (!nodeStats) {
					ns.print(`[WARN] Node ${i} doesn't exist!`);
					continue;
				}
				if (nodeStats.level === 200 && nodeStats.core === 16 && nodeStats.ram === 64) continue // The node is maxed out
				if (hackNodesMaxed) hackNodesMaxed = false;
				const nodeEdited = Object.assign({}, nodeStats);
				// const price = new Object();

				const price = {
					"level": Infinity,
					"core": Infinity,
					"ram": Infinity
				}

				const upgradeEfficiency = new Object();

				const coreProduction = nodeProduction("core", nodeEdited);
				price.core = ns.hacknet.getCoreUpgradeCost(i, 1);
				upgradeEfficiency.core = price.core / coreProduction;

				const ramProduction = nodeProduction("ram", nodeEdited);
				price.ram = ns.hacknet.getRamUpgradeCost(i, 1);
				upgradeEfficiency.ram = price.ram / ramProduction;

				const levelProduction = nodeProduction("level", nodeEdited);
				price.level = ns.hacknet.getLevelUpgradeCost(i, 10);
				upgradeEfficiency.level = price.level / levelProduction;

				const best = findBest(upgradeEfficiency);
				const cost = price[best];
				const efficiency = upgradeEfficiency[best];

				if (efficiency < upgrade.efficiency) {
					upgrade.type = best;
					upgrade.cost = cost;
					upgrade.efficiency = efficiency;
					upgrade.node = i;
				}
			}

			if (hackNetLimit > ns.hacknet.numNodes()) {
				if (ns.hacknet.getPurchaseNodeCost() < upgrade.cost) {
					upgrade.type = "server";
					upgrade.cost = ns.hacknet.getPurchaseNodeCost();
					upgrade.efficiency = -1;
					upgrade.node = -1;
					if (hackNodesMaxed) hackNodesMaxed = false;
				}
			}

			let bought = false;
			if (ns.getPlayer().money > upgrade.cost) {

				let buyMessage = '';

				switch (upgrade.type) {
					case "server":
						buyMessage = `Bought Hacknet-${upgrade.node} for $${numberConvert(Math.ceil(upgrade.cost))}`;
						ns.hacknet.purchaseNode();
						bought = true;
						break;

					case "ram":
						buyMessage = `Upgraded Hacknet-${upgrade.node}'s RAM for $${numberConvert(Math.ceil(upgrade.cost))}`;
						ns.hacknet.upgradeRam(upgrade.node, 1);
						bought = true;
						break;

					case "core":
						buyMessage = `Upgraded Hacknet-${upgrade.node}'s cores for $${numberConvert(Math.ceil(upgrade.cost))}`;
						ns.hacknet.upgradeCore(upgrade.node, 1);
						bought = true;
						break;

					case "level":
						buyMessage = `Upgraded Hacknet-${upgrade.node}'s level for $${numberConvert(Math.ceil(upgrade.cost))}`;
						ns.hacknet.upgradeLevel(upgrade.node, 10);
						bought = true;
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
