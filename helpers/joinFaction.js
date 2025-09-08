/** @param {NS} ns */
export async function main(ns){
	try {
		ns.singularity.joinFaction("Slum Snakes");
		ns.toast("Joined 'Slum Snakes' Faction", "info", 5000);
	} catch {
		return;
	}
}