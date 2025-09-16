import { Color } from "helpers/Functions";

/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	// ns.ui.openTail();

	let hasAllPrograms = true;
	try {
		const programs = {
			"BruteSSH.exe": ns.fileExists("BruteSSH.exe"),
			"FTPCrack.exe": ns.fileExists("FTPCrack.exe"),
			"RelaySMTP.exe": ns.fileExists("RelaySMTP.exe"),
			"HTTPWorm.exe": ns.fileExists("HTTPWorm.exe"),
			"SQLInject.exe": ns.fileExists("SQLInject.exe")
		};

		for(const item in programs){
			// ns.print(item, " -> ", programs[item]);
			if(!programs[item]){
				hasAllPrograms = false;
				// ns.print(`Attempting to buy ${Color.set(item, Color.preset.yellow)}...`);

				const cost = ns.singularity.getDarkwebProgramCost(item);
				if(ns.getPlayer().money > cost * 1.2){
					const boughtItem = ns.singularity.purchaseProgram(item);
					if(boughtItem){
						programs[item] = true;
						ns.toast(`Bought '${item}' for $${ns.formatNumber(cost, 3, 1000, true)}`, "info", 10000);
						ns.print(`Bought ${Color.set(item, Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(cost, 3, 1000, true), Color.preset.lime)}`);
					}
					await ns.sleep(1000);
				}
			}
		}

	} catch (e){
		hasAllPrograms = false;
	}

	// ns.print(hasAllPrograms);
	ns.writePort(4, hasAllPrograms);
}