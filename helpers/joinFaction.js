/** @param {NS} ns */
export async function main(ns){
	try {
		ns.singularity.joinFaction("Slum Snakes");
	} catch {
		return;
	}
}