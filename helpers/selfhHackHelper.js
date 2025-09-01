import { treeTraverse } from "helpers/Functions";

/** @param {NS} ns **/
export async function main(ns){
	ns.ramOverride(10); // Expected RAM usage after singularity is maxed out
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
		ns.singularity.joinFaction(ns.getServer(serverName).organizationName); // Instantly join the faction
	} catch (e){
		return;
	}
}