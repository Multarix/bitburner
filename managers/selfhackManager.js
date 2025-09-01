import { getMaxPorts, gainRoot, yellow, green, red } from "/helpers/Functions.js";
const factions = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();
	// ns.ui.openTail();
	const allServers = JSON.parse(ns.read("/helpers/servers.txt"));

	const growScript = `/scripts/auto/grow.js`;
	const weakenScript = `/scripts/auto/weaken.js`;
	const hackScript = `/scripts/auto/hack.js`;
	const timeConvert = `/helpers/Functions.js`;

	while(true){
		const maxPorts = getMaxPorts(ns);
		const hackLevel = ns.getHackingLevel();

		for(const info in allServers){
			const server = allServers[info];
			if(server.name === "home" || server.name.startsWith("hack-")) continue; // Ignore owned servers

			if(hackLevel > server.hackLevel && maxPorts >= server.ports && !server.hacked){
				if(!ns.hasRootAccess(server.name)){
					gainRoot(ns, server.name);
					await ns.sleep(1000);

					if(!ns.hasRootAccess(server.name)){
						ns.print(red(`There was an issue gaining root access on ${server.name}!`));
						continue;
					}

					if(factions.includes(server.name)){
						ns.run("/helpers/selfHackHelper.js", 1, server.name); // Won't turn on if not enough RAM, as this uses singularity.
						await ns.sleep(1000);
					}
				}

				server.hacked = true;
				const serverRAM = ns.getServerMaxRam(server.name);

				if(ns.getServerMaxMoney(server.name) === 0 || 8 >= serverRAM) continue; // Servers with no money anyway
				if(ns.getServerGrowth(server.name) === 0) continue; // Servers that don't grow

				ns.scp([growScript, weakenScript, hackScript, timeConvert], server.name);
				ns.killall(server.name);

				const growThreads = (serverRAM - 0.1) / ns.getScriptRam(growScript, "home");
				const growRounded = Math.floor(growThreads);
				const weakenThreads = (serverRAM - 0.1) / ns.getScriptRam(weakenScript, "home");
				const weakenRounded = Math.floor(weakenThreads);
				const hackThreads = (serverRAM - 0.1) / ns.getScriptRam(hackScript, "home");
				const hackRounded = Math.floor(hackThreads);

				const pID = ns.exec(hackScript, server.name, hackRounded, growRounded, weakenRounded, hackRounded);
				const msg = (pID !== 0) ? `${yellow(server.name)} ${green("is now auto hacking itself")}.` : `${yellow(server.name)} ${red("failed to start hacking itself")}`;
				ns.print(msg);
			}
		}

		await ns.sleep(10000);
	}
}