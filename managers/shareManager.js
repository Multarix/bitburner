const shareScript = "/scripts/repeat/share.js";

/** @param {NS} ns */
export async function main(ns){
	const hostName = ns.getHostname();

	const shareRAM = ns.getScriptRam(shareScript);
	const availableRAM = (ns.getServerMaxRam(hostName) - 16) - ns.getServerUsedRam(hostName);
	const maxThreads = Math.floor((availableRAM - 0.1) / shareRAM);
	ns.kill(shareScript);

	await ns.sleep(1000);
	if(maxThreads <= 0) return; // Can't run

	ns.toast(`Sharing ${shareRAM * maxThreads}GB of RAM from ${hostName}`, "info", 5000);
	ns.spawn(shareScript, { threads: maxThreads, spawnDelay: 5000 });
}