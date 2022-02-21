/** @param {NS} ns **/
export async function main(ns) {
	const growThreads = ns.args[0];
	const weakenThreads = ns.args[1];
	const hackThreads = ns.args[2];
	const thisServer = ns.getHostname();

	while(ns.getServerMoneyAvailable(thisServer) < ns.getServerMaxMoney(thisServer)){
		await ns.grow(thisServer);
	}
	ns.spawn("/scripts/auto/weaken.js", weakenThreads, growThreads, weakenThreads, hackThreads, "grow");
}
