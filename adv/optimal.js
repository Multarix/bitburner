import { timeConvert } from "/adv/extra/timeConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.print("Script Started");
	let target = ns.args[0];
	if (!target) return ns.toast("No target specified, ending script", "error", "10000");

	ns.run("/adv/extra/rootAccess.js", 1, target);
	await ns.sleep(500);

	const delay = 1000; // For margin of error between functions hitting;
	const minSec = ns.getServerMinSecurityLevel(target);
	const maxMoney = ns.getServerMaxMoney(target);

	/**
	 * @param script {string} Should be `hack`, `grow` or `weaken`
	**/
	const scriptRAM = (script) => {
		const scriptRAMCost = ns.getScriptRam(`/scripts/optimal/${script}.js`, "home");
		return scriptRAMCost;
	}

	/**
	 *	@param type {string} Should be `hack`, `grow` or `weaken`
	 * 	@param threads {number} Amount of threads to run with
	 *	@param id {number} A unique id to prevent script overwriting
	 *	@param waitAmount {number} The delay before the script executes
	**/
	const runScript = (type, threads, id, waitAmount) => {
		ns.run("/adv/extra/waitScript.js", 1, type, threads, target, id, waitAmount);
	}

	// Weaken/ grow/ weaken {hack} {weaken} {grow} {weaken}
	let sleepTime = 0;
	let weakTime = ns.getWeakenTime(target);
	let growTime = ns.getGrowTime(target);
	let hackTime = ns.getHackTime(target);

	let eta = false

	if (ns.getServerSecurityLevel(target) > minSec) { // Initial weaken to min
		ns.print(`Starting initial weaken | ETA: ${timeConvert(weakTime)}`);

		const secIncrease = ns.getServerSecurityLevel(target) - minSec
		let weakThreads = 0;
		while (true) { // Weaken back to min after growing
			weakThreads++
			const weakCheck = ns.weakenAnalyze(weakThreads);
			if (weakCheck >= secIncrease) break;
		}
		runScript("weaken", weakThreads, -1, 0);
		sleepTime = weakTime + 2000;
		eta = true;
	}

	if (ns.getServerMoneyAvailable(target) < maxMoney) { // Raise to max money
		ns.print(`Starting initial grow + weaken${(eta) ? "" : ` | ETA: ${timeConvert(weakTime)}`}`);
		const growThreads = Math.ceil(ns.growthAnalyze(target, maxMoney / ns.getServerMoneyAvailable(target)))
		const growWait = (weakTime + delay) - growTime; // grow to max
		runScript("grow", growThreads, -2, growWait);

		const secIncrease = ns.growthAnalyzeSecurity(growThreads);
		let weakThreads = 0;
		while (true) { // Weaken back to min after growing
			weakThreads++
			const weakCheck = ns.weakenAnalyze(weakThreads);
			if (weakCheck >= secIncrease) break;
		}
		runScript("weaken", weakThreads, -3, 2000); // weaken to land after grow
		sleepTime = weakTime + 4000;
	}
	if (sleepTime > 0) await ns.sleep(sleepTime);

	// Start calculating

	const hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, maxMoney * 0.75)); // Hack 75% of the money from the server;
	if (hackThreads <= 0) {
		hackThreads = 1;
		ns.toast("Hacking threads <= 0, there may be an issue", "warning", 15000);
	}
	let secIncrease = ns.hackAnalyzeSecurity(hackThreads);

	let firstWeakenThreads = 0;
	while (true) { // Weaken back to min after hacking
		await ns.sleep(20);
		firstWeakenThreads++
		const weakCheck = ns.weakenAnalyze(firstWeakenThreads);
		if (weakCheck >= secIncrease) break;
	}

	weakTime = ns.getWeakenTime(target);
	growTime = ns.getGrowTime(target);
	hackTime = ns.getHackTime(target);

	ns.print(`Calculated and running hack & firstWeaken | ETA: ${timeConvert(weakTime + 2000)}`);
	runScript("hack", hackThreads, -4, (weakTime - delay) - hackTime);
	runScript("weaken", firstWeakenThreads, -5, 0);
	await ns.sleep(weakTime + 2000);

	// Should now be 25% of the money left in the server, final calcs before spawning multi scripts
	let growThreads = Math.ceil(ns.growthAnalyze(target, maxMoney / ns.getServerMoneyAvailable(target))); // Threads required to grow back to max
	if (growThreads <= 0) {
		growThreads = 1;
		ns.toast("Grow threads threads <= 0, there may be an issue", "warning", 15000);
	}
	secIncrease = ns.growthAnalyzeSecurity(growThreads);

	let secondWeakenThreads = 0;
	while (true) { // Weaken back to min after growing
		secondWeakenThreads++
		const weakCheck = ns.weakenAnalyze(secondWeakenThreads);
		if (weakCheck >= secIncrease) break;
	}

	weakTime = ns.getWeakenTime(target);
	growTime = ns.getGrowTime(target);
	hackTime = ns.getHackTime(target);

	const growStart = (weakTime - delay) - growTime
	ns.print(`Calculated and running grow & secondWeaken | ETA: ${timeConvert(weakTime + 2000)}`);
	runScript("grow", growThreads, -6, growStart);
	runScript("weaken", secondWeakenThreads, -7, 0);
	await ns.sleep(weakTime + 2000);

	const totalHackRAM = scriptRAM("hack") * hackThreads;
	const totalWeakenRAM = scriptRAM("weaken") * (firstWeakenThreads + secondWeakenThreads);
	const totalGrowRAM = scriptRAM("grow") * growThreads;
	const totalRAM = totalHackRAM + totalWeakenRAM + totalGrowRAM;

	const serverRAM = ns.getServerMaxRam("home");
	let maxInstances = Math.floor(serverRAM / totalRAM) - 1;
	maxInstances = Math.max(maxInstances, 1);
	maxInstances = Math.min(maxInstances, 18);

	const fakeArray = [hackThreads, firstWeakenThreads, growThreads, secondWeakenThreads];
	ns.print(`Able to spawn ${maxInstances} instances | RAM per instance: ${Math.ceil(totalRAM)} GB`);

	// Spawn instances
	for (let i = 0; maxInstances > i; i++) {
		const respawn = (i === (maxInstances - 1)) ? true : false;
		ns.print(`Starting Instance ${i}`);
		ns.run("/adv/spawnOptimal.js", 1, fakeArray.join("|"), target, i, respawn);
		await ns.sleep(12000);
	}
}
