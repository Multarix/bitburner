/** @param {NS} ns **/
export async function main(ns) {
	const growThreads = ns.args[0];
	const weakenThreads = ns.args[1];
	const hackThreads = ns.args[2];
	const lastScript = ns.args[3];
	const thisServer = ns.getHostname();

	while(ns.getServerSecurityLevel(thisServer) > ns.getServerMinSecurityLevel(thisServer)){
		await ns.weaken(thisServer);
	}
	ns.spawn(`/scripts/auto/${(lastScript === "grow") ? "hack" : "grow"}.js`, weakenThreads, growThreads, weakenThreads, hackThreads);
}
