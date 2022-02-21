/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	const allServers = JSON.parse(ns.read("/adv/servers.txt"));

	const growScript = `/scripts/auto/grow.js`;
	const weakenScript = `/scripts/auto/weaken.js`;
	const hackScript = `/scripts/auto/hack.js`;
	const timeConvert = `/adv/extra/numberConvert.js`;

	while (true) {
		let ports = 0;
		if (ns.fileExists("brutessh.exe", "home")) ports++
		if (ns.fileExists("ftpcrack.exe", "home")) ports++
		if (ns.fileExists("httpworm.exe", "home")) ports++
		if (ns.fileExists("relaysmtp.exe", "home")) ports++
		if (ns.fileExists("sqlinject.exe", "home")) ports++

		const hackLevel = ns.getHackingLevel();

		for (const info in allServers) {
			const server = allServers[info]
			if (server.name === "home" || server.name.startsWith("hack-")) continue;
			if (ns.getServerMaxMoney(server.name) === 0 || 4 >= ns.getServerMaxRam(server.name)) continue;
			if (hackLevel > server.hackLevel && ports >= server.ports && !server.hacked) {

				if (!ns.hasRootAccess(server.name)) {
					ns.exec("/adv/extra/rootAccess.js", "home", 1, server.name);
					await ns.sleep(1000);
					if (!ns.hasRootAccess(server.name)){
						ns.print(`Failed to gain root access on ${server.name}`);
						continue;
					}
				}

				server.hacked = true;
				const serverRAM = ns.getServerMaxRam(server.name);

				await ns.scp([growScript, weakenScript, hackScript, timeConvert], server.name);
				await ns.sleep(1000);

				ns.killall(server.name);

				const growThreads = (serverRAM - 0.1) / ns.getScriptRam(growScript, "home");
				const growRounded = Math.floor(growThreads);
				const weakenThreads = (serverRAM - 0.1) / ns.getScriptRam(weakenScript, "home");
				const weakenRounded = Math.floor(weakenThreads);
				const hackThreads = (serverRAM - 0.1) / ns.getScriptRam(hackScript, "home");
				const hackRounded = Math.floor(hackThreads);

				const pID = ns.exec(hackScript, server.name, hackRounded, growRounded, weakenRounded, hackRounded);
				const msg = (pID !== 0) ? `${server.name} is now hacking itself` : `${server.name} failed to start hacking itself`;
				ns.print(msg);
			}
		}
		await ns.sleep(2000);
	}
}
