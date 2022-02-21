/** @param {NS} ns **/
export async function main(ns) {
	const allServers = JSON.parse(ns.read("/adv/servers.txt"));
	while (true) {
		let ports = 0;
		if (ns.fileExists("brutessh.exe", "home")) ports++
		if (ns.fileExists("ftpcrack.exe", "home")) ports++
		if (ns.fileExists("httpworm.exe", "home")) ports++
		if (ns.fileExists("relaysmtp.exe", "home")) ports++
		if (ns.fileExists("sqlinject.exe", "home")) ports++

		const hackLevel = ns.getHackingLevel();

		for (const info in allServers) {
			const server = allServers[info];
			if (server.name === "home" || server.name.startsWith("hack-")) continue;
			if (hackLevel > server.hackLevel && ports >= server.ports && !server.hacked) {

				if (!ns.hasRootAccess(server.name)) {
					ns.exec("/adv/extra/rootAccess.js", "home", 1, server.name);
					await ns.sleep(1000);
					if (!ns.hasRootAccess(server.name)) {
						ns.print(`[Error] Was unable to nuke ${server.name}`);
						continue;
					}
				}
				server.hacked = true;
				ns.print(`[Success] Root access has been granted on ${server.name}`);
			}
		}
		await ns.sleep(2000);
	}
}
