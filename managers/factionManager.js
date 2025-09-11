import { Color } from "helpers/Functions";

const factionsJoined = {};

/**
 * Checks if all combat stats are above the required level
 * @param {import("NetscriptDefinitions").Player} player
 * @param {number} requirement
 * @return {boolean}
 */
function allCombatisAbove(player, requirement){
	if(player.strength < requirement) return false;
	if(player.defense < requirement) return false;
	if(player.dexterity < requirement) return false;
	if(player.agility < requirement) return false;
	return true;
}

/**
 * @param {NS} ns
 * @param {import("NetscriptDefinitions").FactionName} factionName
 */
function joinFaction(ns, factionName){
	const invitations = ns.singularity.checkFactionInvitations();
	if(invitations.includes(factionName)){
		// ns.print(`Attempting to join ${Color.set(factionName, Color.preset.yellow)}...`);
		const joinedFaction = ns.singularity.joinFaction(factionName);
		if(joinedFaction){
			factionsJoined[factionName] = true;
			ns.toast(`Joined ${factionName}`, "info", 5000);
			ns.print(`Joined ${Color.set(factionName, Color.preset.yellow)}`);
		}

		return joinedFaction;
	}

	return false;
}



/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	const TRAVEL_COST = 210000;

	const factions = ns.enums.FactionName;
	const cities = ns.enums.CityName;
	const acceptedFactions = ns.getPlayer().factions;

	// Misc
	// factionsJoined[factions.Netburners] = acceptedFactions.includes(factions.Netburners);
	factionsJoined[factions.TianDiHui] = acceptedFactions.includes(factions.TianDiHui);

	// LateGame
	factionsJoined[factions.TheCovenant] = acceptedFactions.includes(factions.TheCovenant);
	factionsJoined[factions.Illuminati] = acceptedFactions.includes(factions.Illuminati);
	factionsJoined[factions.Daedalus] = acceptedFactions.includes(factions.Daedalus);

	// Criminal
	factionsJoined[factions.SlumSnakes] = acceptedFactions.includes(factions.SlumSnakes);
	factionsJoined[factions.Tetrads] = acceptedFactions.includes(factions.Tetrads);
	factionsJoined[factions.Silhouette] = acceptedFactions.includes(factions.Silhouette);
	factionsJoined[factions.SpeakersForTheDead] = acceptedFactions.includes(factions.SpeakersForTheDead);
	factionsJoined[factions.TheDarkArmy] = acceptedFactions.includes(factions.TheDarkArmy);
	factionsJoined[factions.TheSyndicate] = acceptedFactions.includes(factions.TheSyndicate);

	try {
		const totalAugmentsInstalled = ns.singularity.getOwnedAugmentations(false).length;
		let allJoined = false;
		while(!allJoined){
			await ns.sleep(1000);

			const player = ns.getPlayer();
			const money = player.money;
			const karma = player.karma;
			const kills = player.numPeopleKilled;
			const city = player.city;
			allJoined = true;


			/* ***********************/
			/*                       */
			/*     Criminal Orgs     */
			/*                       */
			/** **********************/


			// Slum Snakes
			let thisFaction = factions.SlumSnakes;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodCombat = allCombatisAbove(player, 30);
				const goodMoney = money > 1000000 + TRAVEL_COST;
				const goodKarma = karma < -9;

				if(goodCombat && goodMoney && goodKarma){
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			// Tetrads
			thisFaction = factions.Tetrads;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodCombat = allCombatisAbove(player, 75);
				const goodKarma = karma < -18;

				if(goodCombat && goodKarma){
					if(![cities.Chongqing, cities.NewTokyo, cities.Ishima].includes(city)) ns.singularity.travelToCity(cities.Chongqing);
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			// Silhouette
			// thisFaction = factions.Silhouette;
			// if(!factionsJoined[thisFaction]){
			// 	const goodCombat = allCombatisAbove(player, 30);
			// 	const goodMoney = money > 1000000;
			// 	const goodKarma = karma < -9;
			//
			// 	if(goodCombat && goodMoney && goodKarma){
			//		await ns.sleep(2000);
			// 		joinFaction(ns, thisFaction);
			// 	}
			// }


			// Speakers for the Dead
			thisFaction = factions.SpeakersForTheDead;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodHacking = player.skills.hacking > 100;
				const goodCombat = allCombatisAbove(player, 300);
				const goodKills = kills > 30;
				const goodKarma = karma < -45;

				if(goodHacking && goodCombat && goodKills && goodKarma){
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			// The Dark Army
			thisFaction = factions.TheDarkArmy;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodHacking = player.skills.hacking > 300;
				const goodCombat = allCombatisAbove(player, 300);
				const goodMoney = money > TRAVEL_COST;
				const goodKills = kills > 5;
				const goodKarma = karma < -45;

				if(goodHacking && goodCombat && goodMoney && goodKills && goodKarma){
					if(city !== cities.Chongqing) ns.singularity.travelToCity(cities.Chongqing);
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			// The Syndicate
			thisFaction = factions.TheSyndicate;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodHacking = player.skills.hacking > 200;
				const goodCombat = allCombatisAbove(player, 200);
				const goodMoney = money > 10000000 + TRAVEL_COST;
				const goodKarma = karma < -90;

				if(goodHacking && goodCombat && goodMoney && goodKarma){
					if(![cities.Aevum, cities.Sector12].includes(city)) ns.singularity.travelToCity(cities.Sector12);
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			/* ***********************/
			/*                       */
			/*       Late Game       */
			/*                       */
			/** **********************/


			// The Covenant
			thisFaction = factions.TheCovenant;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodAugments = totalAugmentsInstalled >= 20;
				const goodHacking = player.skills.hacking > 850;
				const goodCombat = allCombatisAbove(player, 850);
				const goodMoney = money > 75000000000;

				if(goodAugments && goodHacking && goodCombat && goodMoney){
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			// Illuminati
			thisFaction = factions.Illuminati;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodAugments = totalAugmentsInstalled >= 30;
				const goodHacking = player.skills.hacking > 1500;
				const goodCombat = allCombatisAbove(player, 1200);
				const goodMoney = money > 150000000000;

				if(goodAugments && goodHacking && goodCombat && goodMoney){
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			// Daedalus
			thisFaction = factions.Daedalus;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodAugments = totalAugmentsInstalled >= 30;
				const goodHacking = player.skills.hacking > 2500;
				const goodCombat = allCombatisAbove(player, 1500);
				const goodMoney = money > 100000000000;

				if(goodAugments && (goodHacking || goodCombat) && goodMoney){
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}


			/* **********************/
			/*                      */
			/*         Misc         */
			/*                      */
			/** *********************/

			// Tian Di Hui
			thisFaction = factions.TianDiHui;
			if(!factionsJoined[thisFaction]){
				allJoined = false;
				const goodHacking = player.skills.hacking > 50;
				const goodMoney = money > 1000000 + TRAVEL_COST;

				if(goodHacking && goodMoney){
					if(![cities.Chongqing, cities.NewTokyo, cities.Ishima].includes(city)) ns.singularity.travelToCity(cities.NewTokyo);
					const joined = joinFaction(ns, thisFaction);
					if(joined) continue;
				}
			}
		}
	} catch {
		return;
	}
}