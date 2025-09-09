import { Color } from "helpers/Functions";

/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	ns.print(Color.set("Starting Script!", Color.preset.lightGreen));

	const cityNames = ns.enums.CityName;
	const locationNames = ns.enums.LocationName;
	// const TRAVEL_COST = 200000;

	const buyLocation = {};
	buyLocation[cityNames.Sector12] = locationNames.Sector12AlphaEnterprises;
	buyLocation[cityNames.Aevum] = locationNames.AevumFulcrumTechnologies;
	buyLocation[cityNames.Volhaven] = locationNames.VolhavenOmniTekIncorporated;
	buyLocation[cityNames.Ishima] = locationNames.IshimaOmegaSoftware;

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

		for(const item in programs){
			if(programs[item]) ns.print(`Already own ${Color.set(item, Color.preset.yellow)}!`);
		}


		let continueCycle = true;
		while(continueCycle){
			continueCycle = false;
			for(const item in programs){
				// ns.print(item, " -> ", programs[item]);

				if(!programs[item]){
					continueCycle = true;
					// ns.print(`Attempting to buy ${Color.set(item, Color.preset.yellow)}...`);

					const cost = ns.singularity.getDarkwebProgramCost(item);
					if(ns.getPlayer().money > cost * 1.2){
						const boughtItem = ns.singularity.purchaseProgram(item);
						if(boughtItem){
							programs[item] = true;
							ns.toast(`Bought '${item}' for $${ns.formatNumber(cost, 3, 1000, true)}`, "info", 10000);
							ns.print(`Bought ${Color.set(item, Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(cost, 3, 1000, true), Color.preset.lime)}`);
						}
					}
				}

				await ns.sleep(100);
			}
		}


		let ramFine = false;
		let coresFine = false;
		while((!ramFine || !coresFine)){
			const home = ns.getServer("home");
			const cpuCores = home.cpuCores;
			const ram = home.maxRam;

			ramFine = ram >= 64000;
			coresFine = cpuCores >= 8;

			if(!ramFine){
				const cost = ns.singularity.getUpgradeHomeRamCost();
				// If we can afford it...
				if(ns.getPlayer().money > cost * 1.1){
					// Move player if not in a city that can buy it
					if(!buyLocation[ns.getPlayer().city]) ns.singularity.travelToCity(cityNames.Sector12);
					ns.singularity.goToLocation(buyLocation[ns.getPlayer().city]);
					const upgraded = ns.singularity.upgradeHomeRam();

					if(upgraded){
						ns.toast(`Upgraded RAM for $${ns.formatNumber(cost, 3, 1000, true)} ${ns.formatRam(ram)} ➜ ${ns.formatRam(ram * 2)}`, "info", 10000);
						ns.print(`Upgraded ${Color.set("RAM", Color.preset.yellow)} for $${ns.formatNumber(cost, 3, 1000, true)} ${ns.formatRam(ram)} ➜ ${ns.formatRam(ram * 2)}`);
					}
				}
			}

			if(!ramFine){
				const cost = ns.singularity.getUpgradeHomeCoresCost();
				// If we can afford it...
				if(ns.getPlayer().money > cost * 1.1){
					// Move player if not in a city that can buy it
					if(!buyLocation[ns.getPlayer().city]) ns.singularity.travelToCity(cityNames.Sector12);
					ns.singularity.goToLocation(buyLocation[ns.getPlayer().city]);
					const upgraded = ns.singularity.upgradeHomeCores();

					if(upgraded){
						ns.toast(`Upgraded CPU Cores for $${ns.formatNumber(cost, 3, 1000, true)} ${cpuCores} ➜ ${cpuCores + 1}`, "info", 10000);
						ns.print(`Upgraded ${Color.set("CPU Cores", Color.preset.yellow)} for $${ns.formatNumber(cost, 3, 1000, true)} ${cpuCores} ➜ ${cpuCores + 1}`);
					}
				}
			}
		}

	} catch (e){
		ns.print(e);
		ns.ui.openTail();
		ns.exit();
	}
}