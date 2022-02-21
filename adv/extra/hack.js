/** @param {NS} ns **/
export async function main(ns) {
	// ns.disableLog("ALL");
	// ns.print("Script Started");

	const server = ns.args[0]
	while (true) {
		// ns.print(`Hacking ${server} for $${ns.hackAnalyze(server) * (ns.getServerMaxRam() / ns.getScriptRam('/adv/hack.js', ns.getHostname()))} in ${ns.getHackTime(server)}`);
		await ns.hack(server);
	}
}
