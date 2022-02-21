/** @param {NS} ns **/
export async function main(ns) {
	const fileList = ["/scripts/weaken.js", "/scripts/grow.js", "/scripts/hack.js", "/adv/extra/numberConvert.js"]

	const purchasedServers = ns.getPurchasedServers();
	for(const server of purchasedServers){
		for(const file of fileList){
			if(ns.fileExists(file, server)) continue;
			await ns.scp(file, server);
		}
	}
}
