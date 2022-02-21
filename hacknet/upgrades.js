/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.print("Script Started");

	let hacknetCap = 0; // Script Upgrades: Make more hacknet nodes after the original 9 have been completed.
	const upgradeHacknet = async () => {
		let hackNetsMaxed = false;
		const cheapestOption = new Object();
		while (!hackNetsMaxed) {
			cheapestOption.type = null;
			cheapestOption.cost = Infinity;
			cheapestOption.node = -1;

			const hackNodes = ns.hacknet.numNodes();
			cheapestOption.newServerCost = null;
			if (ns.hacknet.maxNumNodes() > hackNodes && hacknetCap > hackNodes) {
				cheapestOption.type = "Server";
				cheapestOption.cost = ns.hacknet.getPurchaseNodeCost();
			};

			for (let i = 0; i < hackNodes; i++) {
				const level = ns.hacknet.getLevelUpgradeCost(i, 10);
				const ram = ns.hacknet.getRamUpgradeCost(i, 1);
				const core = ns.hacknet.getCoreUpgradeCost(i, 1);
				if (cheapestOption.cost > level) {
					cheapestOption.node = i;
					cheapestOption.cost = level;
					cheapestOption.type = "Level";
				};
				if (cheapestOption.cost > ram) {
					cheapestOption.node = i;
					cheapestOption.cost = ram;
					cheapestOption.type = "RAM";
				};
				if (cheapestOption.cost > core) {
					cheapestOption.node = i;
					cheapestOption.cost = core;
					cheapestOption.type = "Core";
				};
			}

			if (!cheapestOption.type && cheapestOption.node === -1) {
				hackNetsMaxed = true;
				continue;
			}

			if (ns.getPlayer().money > cheapestOption.cost) {
				if (cheapestOption.type === "Server") {
					ns.hacknet.purchaseNode();
					ns.toast(`Bought hacknet node #${hackNodes + 1} for \$${Math.round(cheapestOption.cost).toLocaleString()}`);
				} else {
					if (cheapestOption.type === "Level") ns.hacknet.upgradeLevel(cheapestOption.node, 10);
					if (cheapestOption.type === "RAM") ns.hacknet.upgradeRam(cheapestOption.node, 1);
					if (cheapestOption.type === "Core") ns.hacknet.upgradeCore(cheapestOption.node, 1);
					ns.toast(`Bought upgrade: ${cheapestOption.type} | Node: ${cheapestOption.node} | Price: \$${Math.round(cheapestOption.cost).toLocaleString()}`);
				}
			}

			await ns.sleep(100);
		}
	}

	const hackNodes = async () => {
		let nodesMaxedOut = true;
		const nodeCount = ns.hacknet.numNodes();
		for (let i = 0; i < nodeCount; i++) {
			const nodeInfo = ns.hacknet.getNodeStats(i);
			if (nodeInfo.level !== 200 || nodeInfo.cores !== 16 || nodeInfo.ram !== 64) nodesMaxedOut = false;
		}

		if (nodesMaxedOut) hacknetCap += 3;
		if (hacknetCap <= 24) {
			await upgradeHacknet();
			await hackNodes();
		}
	}
	await hackNodes();
}
