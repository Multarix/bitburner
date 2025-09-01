/** @param {NS} ns **/
export async function main(ns){
	try {
		while(!ns.hasTorRouter()){
			if(ns.getPlayer().money > 200000){
				ns.singularity.purchaseTor();
			}

			await ns.sleep(10000);
		}

		const owns = {
			"BruteSSH.exe": ns.fileExists("BruteSSH.exe"),
			"FTPCrack.exe": ns.fileExists("FTPCrack.exe"),
			"RelaySMTP.exe": ns.fileExists("RelaySMTP.exe"),
			"HTTPWorm.exe": ns.fileExists("HTTPWorm.exe"),
			"SQLInject.exe": ns.fileExists("SQLInject.exe")
		};

		while(true){
			const money = ns.getPlayer().money;

			let trueCount = 0;
			for(const item in owns){
				if(owns[item]){
					trueCount += 1;
					continue;
				}

				const cost = ns.singularity.getDarkwebProgramCost(item);
				if(money > cost * 1.2){
					const boughtItem = ns.singularity.purchaseProgram(item);
					if(boughtItem) ns.toast(`Bought '${item}'!`);
				}
			}

			const ramCost = ns.singularity.getUpgradeHomeRamCost();
			if(money > ramCost * 1.2){
				ns.singularity.upgradeHomeRam();
			}

			const coreCost = ns.singularity.getUpgradeHomeCoresCost();
			if(money > coreCost * 1.2){
				ns.singularity.upgradeHomeCores();
			}

			if(trueCount === 5) break;
			await ns.sleep(10000);
		}
	} catch (e){
		return;
	}
}