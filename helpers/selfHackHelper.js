import { treeTraverse } from "helpers/Functions";
const serverToFaction = {
	"CSEC": "CyberSec",
	"avmnite-02h": "NiteSec",
	"I.I.I.I": "The Black Hand",
	"run4theh111z": "BitRunners"
};

/** @param {NS} ns **/
export async function main(ns){
	// ns.ui.openTail();
	// ns.ramOverride(10); // Expected RAM usage after singularity is maxed out
	try {
		ns.singularity.connect("home");
		const serverName = ns.args[0];
		const servers = treeTraverse(ns, "home", serverName);

		// Go to the server
		for(const server of servers.reverse()){
			ns.singularity.connect(server);
		}

		// Backdoor it
		await ns.singularity.installBackdoor();

		// Return home
		ns.singularity.connect("home");

		// Join the Faction
		const organisationName = serverToFaction[serverName];
		const joinedFaction = ns.singularity.joinFaction(organisationName); // Instantly join the faction
		if(joinedFaction) ns.toast(`Joined ${organisationName}`, "info", 5000);
	} catch (e){
		return;
	}
}