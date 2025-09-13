import { Color } from "helpers/Functions";

/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	try {
		const cityNames = ns.enums.CityName;
		const locationNames = ns.enums.LocationName;
		const TRAVEL_COST = 200000;

		const buyLocation = {};
		buyLocation[cityNames.Sector12] = locationNames.Sector12AlphaEnterprises;
		buyLocation[cityNames.Aevum] = locationNames.AevumFulcrumTechnologies;
		buyLocation[cityNames.Volhaven] = locationNames.VolhavenOmniTekIncorporated;
		buyLocation[cityNames.Ishima] = locationNames.IshimaOmegaSoftware;

		const player = ns.getPlayer();
		const cost = ns.singularity.getUpgradeHomeRamCost();
		const city = player.city;
		const currentTask = ns.args[0];

		const homeServer = ns.getServer("home");
		const ram = homeServer.maxRam;

		// If we can afford it...
		if(player.money > (cost * 1.1) + TRAVEL_COST){
			// Move player if not in a city that can buy it
			if(!buyLocation[player.city] && player.money > TRAVEL_COST) ns.singularity.travelToCity(cityNames.Sector12);
			ns.singularity.goToLocation(buyLocation[ns.getPlayer().city]);
			const upgraded = ns.singularity.upgradeHomeRam();

			if(upgraded){
				ns.toast(`Upgraded RAM for $${ns.formatNumber(cost, 3, 1000, true)} ${ns.formatRam(ram)} ➜ ${ns.formatRam(ram * 2)}`, "info", 10000);
				ns.print(`Upgraded ${Color.set("RAM", Color.preset.yellow)} for ${Color.set("$" + ns.formatNumber(cost, 3, 1000, true), Color.preset.lime)} ${ns.formatRam(ram)} ➜ ${ns.formatRam(ram * 2)}`);
				ns.print(`Next ${Color.set("RAM", Color.preset.yellow)} upgrade: ${Color.set("$" + ns.formatNumber(ns.singularity.getUpgradeHomeRamCost(), 3, 1000, true), Color.preset.red)} ${ns.formatRam(ram * 2)} ➜ ${ns.formatRam(ram * 4)}`);
			}

			ns.run("/helpers/returnToWork.js", { threads: 1, preventDuplicates: true }, city, currentTask);
			await ns.sleep(1000);
		}
	} catch (e){
		null;
	}

	const homeServer = ns.getServer("home");
	const ram = homeServer.maxRam;
	const ramFine = ram >= 64000;

	ns.writePort(4, ramFine);
}