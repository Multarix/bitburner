/** @param {NS} ns **/
export async function main(ns) {
	for (const server of ns.getPurchasedServers()) {
		ns.deleteServer(server);
	}
}
