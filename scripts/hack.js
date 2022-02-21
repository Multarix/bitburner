import { numberConvert } from "/adv/extra/numberConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	const server = ns.args[0]
	while (true) {
		// ns.print(`Hacking ${server} for $${ns.hackAnalyze(server) * (ns.getServerMaxRam() / ns.getScriptRam('/adv/hack.js', ns.getHostname()))} in ${ns.getHackTime(server)}`);
		const money = await ns.hack(server);
		if(money > 0) ns.toast(`Hacked ${server} for $${numberConvert(money)}`, "success", "8000");
	}
}
