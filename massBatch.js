/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();
	ns.ui.openTail();

	const target = ns.args[0];
	const mockServer = ns.getServer(target);
	mockServer.hackDifficulty = mockServer.minDifficulty;

	const weakenTime = ns.formulas.hacking.weakenTime(mockServer, ns.getPlayer());
	const timeBetween = 15000;

	const toSpawn = Math.floor(weakenTime / timeBetween);

	ns.print(`To Spawn: ${toSpawn}, WeakenTime: ${weakenTime}`);
	for(let i = 0; i < toSpawn; i++){
		ns.print(`Starting Manager #${i}`);
		ns.run("/managers/batchingManager.jsx", 1, target, i);
		await ns.sleep(timeBetween);
	}
}