import { treeTraverse, cyan, yellow, green } from "helpers/Functions";

const factions = {
	"CyberSec   ": "CSEC",
	"NiteSec    ": "avmnite-02h",
	"BlackHand  ": "I.I.I.I",
	"BitRunner  ": "run4theh111z",
	"WorldDaemon": "w0r1d_d43m0n"
};


/** @param {NS} ns **/
export async function main(ns){
	const target = ns.args[0];


	if(target === "factions"){
		for(const faction in factions){
			const serverName = factions[faction];
			const path = treeTraverse(ns, "home", serverName);

			if(path.length > 0){
				const hackingLevel = ns.getServerRequiredHackingLevel(serverName);
				ns.run("/jsx/CopyButton.jsx", 1, faction, `connect ${path.reverse().join(';connect ')};open`, hackingLevel);
				await ns.sleep(20);
			} else {
				ns.tprint(`Couldn't find the ${serverName} server!`);
			}
		}
	} else {
		const path = treeTraverse(ns, "home", target);
		if(path.length > 0){
			const server = ns.getServer(target);
			ns.tprint(`\nMax Money: ${green(ns.formatNumber(server.moneyMax))} | Min Sec: ${cyan(server.minDifficulty)} | Current Sec: ${yellow(server.hackDifficulty)}`);
			ns.run("/jsx/CopyButton.jsx", 1, target, `connect ${path.reverse().join(';connect ')}`, ns.getServerRequiredHackingLevel(target));
		} else {
			ns.tprint(`Couldn't find the ${target} server!`);
		}
	}
}