import { timeConvert } from "/adv/extra/timeConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	const args = ns.args[0].split("|");
	const target = ns.args[1];
	const ver = ns.args[2];
	const respawn = ns.args[3];

	const hackThreads = args[0];
	const firstWeakenThreads = args[1];
	const growThreads = args[2];
	const secondWeakenThreads = args[3];

	const delay = 1000;

	/**
	 *	@param {string} type `"hack"`, `"grow"` or `"weaken"`
	 * 	@param {number} threads  Amount of threads to run with
	 *	@param {number} id A unique id to prevent script overwriting
	 *	@param {number} waitAmount The delay before the script executes
	**/
	const runScript = (type, threads, id, waitAmount) => {
		ns.run("/adv/extra/waitScript.js", 1, type, threads, target, id, waitAmount);
	}

	let cycle = 0;
	while (cycle < 5) {
		if(cycle >= 5) break;
		cycle += 1;
		const weakTime = ns.getWeakenTime(target);
		const growTime = ns.getGrowTime(target);
		const hackTime = ns.getHackTime(target);
		ns.print(`Starting Cycle ${cycle} | ETA: ${timeConvert(weakTime + (delay * 4))}`);

		const hackStartTime = (weakTime - delay) - hackTime;
		const growStartTime = (weakTime + delay) - growTime;

		ns.print(`- Hacking starts in ${timeConvert(hackStartTime)} (${hackThreads} Threads) | Success Chance: ${Math.round(ns.hackAnalyzeChance(target) * 100)}%`);
		runScript("hack", hackThreads, ver, hackStartTime); 					// Hack 	= -1000 from first weaken
		ns.print(`-- Weak-1 starts now (${firstWeakenThreads} Threads)`);
		runScript("weaken", firstWeakenThreads, ver, 0); 						// Weaken 	= base
		ns.print(`--- Grow starts in ${timeConvert(growStartTime)} (${growThreads} Threads)`);
		runScript("grow", growThreads, ver, growStartTime); 					// Grow 	= + delay from first weaken;
		ns.print(`---- Weak-2 starts in ${timeConvert(delay * 2)} (${secondWeakenThreads} Threads)`);
		runScript("weaken", secondWeakenThreads, (ver + 0.5), (delay * 2));		// Weaken	= + (delay * 2) from first weaken;

		await ns.sleep(weakTime + (delay * 3));
	}
	if(respawn) ns.run("/adv/optimal.js", 1, target)
}
