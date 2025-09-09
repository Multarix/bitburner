import { Color } from "helpers/Functions";

/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	ns.print(Color.set("Starting Script!", Color.preset.lightGreen));

	try {
		while(!ns.hasTorRouter()){
			if(ns.getPlayer().money > 200000){
				ns.singularity.purchaseTor();
			}

			await ns.sleep(10000);
		}

		const programs = {
			"BruteSSH.exe": ns.fileExists("BruteSSH.exe"),
			"FTPCrack.exe": ns.fileExists("FTPCrack.exe"),
			"RelaySMTP.exe": ns.fileExists("RelaySMTP.exe"),
			"HTTPWorm.exe": ns.fileExists("HTTPWorm.exe"),
			"SQLInject.exe": ns.fileExists("SQLInject.exe")
		};

		let RAMFine = false;
		let coresFine = false;
		let boughtItems = 0;
		while((!RAMFine || !coresFine || (boughtItems < 5))){
			const server = ns.getServer("home");
			const money = server.moneyAvailable;
			// const currentRam = server.maxRam;
			// const currentCores = server.cpuCores;

			RAMFine = true;
			coresFine = true;

			boughtItems = 0;
			for(const item in programs){
				if(programs[item]){
					boughtItems += 1;
					continue;
				}

				ns.print(boughtItems);

				const cost = ns.singularity.getDarkwebProgramCost(item);
				if(money > cost * 1.2){
					const boughtItem = ns.singularity.purchaseProgram(item);
					programs[item] = boughtItem;
					if(boughtItem){
						ns.toast(`Bought '${item}' for $${ns.formatNumber(cost, 3, 1000, true)}`, "info", 10000);
						ns.print(`Bought ${Color.set(item, Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(cost, 3, 1000, true)), Color.preset.lime}`);
					}
				}
			}

			/*
			if(currentRam < 64000){ // 64TB
				RAMFine = false;

				ns.singularity.travelToCity("Sector-12");
				const ramCost = ns.singularity.getUpgradeHomeRamCost();
				if(money > ramCost * 1.2){
					ns.singularity.upgradeHomeRam();
					ns.toast(`Upgraded RAM for $${ns.formatNumber(ramCost, 3, 1000, true)}`, "info", 10000);
					ns.print(`Upgraded ${Color.set("RAM", Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(ramCost, 3, 1000, true)), Color.preset.lime}`, 5000);
				}

			}

			if(currentCores < 8){
				coresFine = false;

				const coreCost = ns.singularity.getUpgradeHomeCoresCost();
				if(money > coreCost * 1.2){
					ns.singularity.upgradeHomeCores();
					ns.toast(`Upgraded Cores for $${ns.formatNumber(coreCost, 3, 1000, true)}`, "info", 10000);
					ns.print(`Upgraded ${Color.set("Cores", Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(coreCost, 3, 1000, true)), Color.preset.lime}`, 5000);
				}

			}
			*/
			await ns.sleep(1000);
		}
	} catch (e){
		return;
	}
}