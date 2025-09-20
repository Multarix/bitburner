import { Color } from "helpers/Functions";

/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	const player = ns.getPlayer();
	const city = player.city;
	const money = player.money;

	const cityNames = ns.enums.CityName;
	const locationNames = ns.enums.LocationName;
	const TRAVEL_COST = 200000;

	const buyLocation = {};
	buyLocation[cityNames.Sector12] = locationNames.Sector12AlphaEnterprises;
	buyLocation[cityNames.Aevum] = locationNames.AevumFulcrumTechnologies;
	buyLocation[cityNames.Volhaven] = locationNames.VolhavenOmniTekIncorporated;
	buyLocation[cityNames.Ishima] = locationNames.IshimaOmegaSoftware;

	try {
		const cost = ns.singularity.getUpgradeHomeRamCost();

		// If we can afford it...
		if(player.money > (cost * 1.05) + TRAVEL_COST){
			// Move player if not in a city that can buy it
			if(!buyLocation[city] && money > TRAVEL_COST) ns.singularity.travelToCity(cityNames.Sector12);
			const arrived = ns.singularity.goToLocation(buyLocation[ns.getPlayer().city]);

			if(arrived){
				const upgraded = ns.singularity.upgradeHomeRam();

				if(upgraded){
					ns.toast(`Upgraded RAM for $${ns.formatNumber(cost, 3, 1000, true)} ${ns.formatRam(ram)} ➜ ${ns.formatRam(ram * 2)}`, "info", 10000);
					ns.print(`Upgraded ${Color.set("RAM", Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(cost, 3, 1000, true), Color.preset.lime)} ${ns.formatRam(ram)} ➜ ${ns.formatRam(ram * 2)}`);
					ns.print(`Next ${Color.set("RAM", Color.preset.yellow)} upgrade: ${Color.set("$" + ns.formatNumber(ns.singularity.getUpgradeHomeRamCost(), 3, 1000, true), Color.preset.red)} ${ns.formatRam(ram * 2)} ➜ ${ns.formatRam(ram * 4)}`);
				}

				ns.run("/helpers/returnToWork.js", { threads: 1, preventDuplicates: true }, city);
				await ns.sleep(1000);

				const homeServer = ns.getServer("home");
				const ram = homeServer.maxRam;
			}
		}

	} catch (e){
		null;
	}

	const homeServer = ns.getServer("home");
	const ram = homeServer.maxRam;
	const ramFine = ram >= 64000;

	ns.writePort(4, ramFine);
}