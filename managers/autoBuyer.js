import { Color } from "helpers/Functions";

/**
 * @param {NS} ns
 * @param {string} destination
 */
function travelToCity(ns, destination){
	const player = ns.getPlayer();
	const currentCity = player.city;
	const playerMoney = player.money;

	if(currentCity === destination)	return true;
	if(playerMoney > 200000) return ns.singularity.travelToCity(destination);
}


/**
 * @param {NS} ns
 * @param {import("NetscriptDefinitions").Task} task
 **/
function returnToCurrentWork(ns, city, task){
	switch(task.type){
		case "CLASS": {
			const classType = task.classType;
			const location = task.location;
			travelToCity(ns, city);
			ns.singularity.universityCourse(location, classType, true);
			break;
		}
		case "COMPANY": {
			const companyName = task.companyName;
			travelToCity(ns, city);
			ns.singularity.workForCompany(companyName, true);
			break;
		}
		case "CREATE_PROGRAM": {
			const programName = task.programName;
			ns.singularity.createProgram(programName, true);
			break;
		}
		case "CRIME": {
			const crimeType = task.crimeType;
			ns.singularity.goToLocation("The Slums");
			ns.singularity.commitCrime(crimeType, true);
			break;
		}
		case "FACTION": {
			const factionName = task.factionName;
			const factionWork = task.factionWorkType;
			ns.singularity.workForFaction(factionName, factionWork, true);
			break;
		}
		default: {
			// This is grafting, hopefully this is all not needed
		}
	}
}


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
		let ramFine = false;
		let coresFine = false;
		while((continueCycle || !ramFine || !coresFine)){
			try {
				const city = ns.getPlayer().city;
				const currentTask = ns.singularity.getCurrentWork();

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
							returnToCurrentWork(ns, city, currentTask);
						}
					}

					await ns.sleep(100);
				}

				const home = ns.getServer("home");
				const cpuCores = home.cpuCores;
				const ram = home.maxRam;

				ramFine = ram >= 64000;
				// coresFine = cpuCores >= 4;
				coresFine = true;

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
							ns.print(`Upgraded ${Color.set("RAM", Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(cost, 3, 1000, true), Color.preset.lime)} ${ns.formatRam(ram)} ➜ ${ns.formatRam(ram * 2)}`);
							ns.print(`Next ${Color.set("RAM", Color.preset.yellow)} upgrade: ${Color.set("$" + ns.formatNumber(ns.singularity.getUpgradeHomeRamCost(), 3, 1000, true), Color.preset.red)} ${ns.formatRam(ram * 2)} ➜ ${ns.formatRam(ram * 4)}`);
						}

						returnToCurrentWork(ns, city, currentTask);
					}
				}

				// if(!coresFine){
				// 	const cost = ns.singularity.getUpgradeHomeCoresCost();
				// 	// If we can afford it...
				// 	if(ns.getPlayer().money > cost * 1.1){
				// 	// Move player if not in a city that can buy it
				// 		if(!buyLocation[ns.getPlayer().city]) ns.singularity.travelToCity(cityNames.Sector12);
				// 		ns.singularity.goToLocation(buyLocation[ns.getPlayer().city]);
				// 		const upgraded = ns.singularity.upgradeHomeCores();

				// 		if(upgraded){
				// 			ns.toast(`Upgraded CPU Cores for $${ns.formatNumber(cost, 3, 1000, true)} ${cpuCores} ➜ ${cpuCores + 1}`, "info", 10000);
				// 			ns.print(`Upgraded ${Color.set("CPU Cores", Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(cost, 3, 1000, true), Color.preset.lime)} ${cpuCores} ➜ ${cpuCores + 1}`);
				// 		}

				// 		returnToCurrentWork(ns, city, currentTask);
				// 	}
				// }


			} catch {
				continue;
			}
			// ns.singularity.setFocus(true);
			await ns.sleep(10000);
		}

	} catch (e){
		ns.print(Color.set("Error:", Color.preset.red));
		ns.print(e.message);
		ns.ui.openTail();
		ns.exit();
	}

	ns.print(Color.set("Finished Auto-Buying!", Color.preset.red));
}