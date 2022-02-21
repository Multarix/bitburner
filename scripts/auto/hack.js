import { numberConvert } from "adv/extra/numberConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	const growThreads = ns.args[0];
	const weakenThreads = ns.args[1];
	const hackThreads = ns.args[2];
	const thisServer = ns.getHostname();

	while(ns.getServerMoneyAvailable(thisServer) >= (ns.getServerMaxMoney(thisServer) * 0.01)){
		const money = await ns.hack(thisServer);
		if(money > 0) ns.toast(`Hacked ${thisServer} for $${numberConvert(money)}`, "success", 8000);
	}
	ns.spawn("/scripts/auto/weaken.js", weakenThreads, growThreads, weakenThreads, hackThreads, "hack");
}
