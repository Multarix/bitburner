import { timeConvert, gainRoot, numberConvert } from "/helpers/Functions.js";
import { Colors } from "/jsx/Colors.jsx";
import { Timer } from "/jsx/Timer.jsx";


/**
 * @param {NS} ns
 * @param {string} type
 * @param {number} threads
 * @param {string} target
 * @param {number} eta
 **/
async function spawnExec(ns, type, threads, target, delay = 0){
	// await ns.asleep(delay);
	ns.exec(`/scripts/single/${type}.js`, "home", Math.max(threads, 1), target);
}

const gap = 2000; // Gap between each grow/weak/hack execution hitting

/** @param {NS} ns */
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();
	ns.print("Starting Script!");

	// Misc
	ns.ui.openTail();
	ns.ui.resizeTail(660, 60);
	const [_winX, winY] = ns.ui.windowSize();
	const pos = ns.args[1] || 0;
	ns.ui.moveTail(250, (winY - 100) - (60 * (pos + 1))); // Bottom Left Corner

	const target = ns.args[0];
	if(!target) throw "No target was specified";

	ns.ui.setTailTitle(<Colors color="white"> Batch Hacking {target}</Colors>);

	ns.killall(target);
	ns.scriptKill("/scripts/repeat/share.js", "home");
	ns.scriptKill("/managers/shareManger.js", "home");

	if(!ns.hasRootAccess(target)){
		gainRoot(ns, target);
		await ns.sleep(gap);
		if(!ns.hasRootAccess(target)){
			return ns.printRaw(<Colors color="red">Could not gain access to server! Stopping script!</Colors>);
		}
	}

	const actualServer = ns.getServer(target);
	const mockServer = ns.formulas.mockServer();
	mockServer.baseDifficulty = actualServer.baseDifficulty;
	mockServer.moneyMax = actualServer.moneyMax;
	mockServer.moneyAvailable = actualServer.moneyMax * 0.35;
	mockServer.minDifficulty = actualServer.minDifficulty;
	mockServer.hackDifficulty = actualServer.minDifficulty;
	mockServer.requiredHackingSkill = actualServer.requiredHackingSkill;
	mockServer.serverGrowth = actualServer.serverGrowth;
	mockServer.hasAdminRights = true;
	mockServer.purchasedByPlayer = false;

	// Stop the related scripts when the script stops
	ns.atExit(() => {
		const thisPC = ns.getHostname();
		ns.kill("/scripts/single/weaken.js", thisPC, target);
		ns.kill("/scripts/single/grow.js", thisPC, target);
		ns.kill("/scripts/single/hack.js", thisPC, target);
	});


	while(true){
		// Always aim for 45% of the max money on the server, but if that's more than what's available, only aim for 10% of the available
		const optimalTake = (actualServer.moneyMax * 0.9 < ns.getServerMoneyAvailable(target)) ? actualServer.moneyMax * 0.45 : 1;

		const weakTime = ns.getWeakenTime(target);
		const hackingTime = ns.getHackTime(target);
		const growthTime = ns.getGrowTime(target);
		const cores = ns.getServer("home").cpuCores;

		// This is when the final weaken should hit
		const cycleEnd = weakTime + (gap * 3);
		const growEnd = cycleEnd - gap;
		const weakEnd = growEnd - gap;
		const hackEnd = weakEnd - gap;

		const growStart = growEnd - growthTime;
		const weakenStart = weakEnd - weakTime;
		const hackStart = hackEnd - hackingTime;
		const cycleEndStart = cycleEnd - weakTime;


		const hackThreads = Math.max(Math.ceil(ns.hackAnalyzeThreads(target, optimalTake)), 1);
		const securityAfterHack = ns.hackAnalyzeSecurity(hackThreads, target) + ns.getServerSecurityLevel(target);

		let weak1Threads = 1;

		// @ignore-infinite
		while(true){
			const security = securityAfterHack - ns.weakenAnalyze(weak1Threads, cores);
			if(security <= actualServer.minDifficulty) break;
			weak1Threads += 1;
		}


		const growthThreads = Math.ceil((ns.formulas.hacking.growThreads(mockServer, ns.getPlayer(), mockServer.moneyMax, cores) * 1.5) + 10); // Toss in a few extra just in case
		const securityAfterGrowth = ns.growthAnalyzeSecurity(growthThreads, target, cores) + ns.getServerSecurityLevel(target);

		let weak2Threads = 1;
		// @ignore-infinite
		while(true){
			const security = securityAfterGrowth - ns.weakenAnalyze(weak2Threads, cores);
			if(security <= actualServer.minDifficulty) break;
			weak2Threads += 1;
		}

		weak1Threads = Math.ceil((weak1Threads + 10) * 3);
		weak2Threads = Math.ceil((weak2Threads + 10) * 3);

		const weakRAM = (weak1Threads + weak2Threads) * ns.getScriptRam("/scripts/single/weaken.js");
		const growRAM = growthThreads * ns.getScriptRam("/scripts/single/grow.js");
		const hackRAM = hackThreads * ns.getScriptRam("/scripts/single/hack.js");

		ns.ui.setTailTitle(<Colors color="white"> {target} ${numberConvert(ns.getServerMoneyAvailable(target))} (${numberConvert(ns.getServerMaxMoney(target))}) | {Math.round((weakRAM + growRAM + hackRAM) * 100) / 100}GB | <Timer countdown={weakTime + cycleEndStart + gap} startTime={Date.now()} /> [{timeConvert(weakTime + cycleEndStart + gap)}]</Colors>);

		setTimeout(() => {
			spawnExec(ns, "grow", Math.ceil(growthThreads), target, weakenStart);
		}, growStart);

		setTimeout(() => {
			spawnExec(ns, "weaken", Math.ceil(weak1Threads), target, weakenStart);
		}, weakenStart);

		setTimeout(() => {
			spawnExec(ns, "hack", Math.ceil(hackThreads), target, hackStart);
		}, hackStart);

		setTimeout(() => {
			spawnExec(ns, "weaken", Math.ceil(weak2Threads), target, cycleEndStart);
		}, cycleEndStart);

		const hackETA = <Colors color="white">Hack:<Colors color="yellow"> <Timer countdown={hackingTime + hackStart} startTime={Date.now()} /></Colors></Colors>;
		const weak1ETA = <Colors color="white">Weak1:<Colors color="yellow"> <Timer countdown={weakTime + weakenStart} startTime={Date.now()} /></Colors></Colors>;
		const growETA = <Colors color="white">Grow:<Colors color="yellow"> <Timer countdown={growthTime + growStart} startTime={Date.now()} /></Colors></Colors>;
		const weak2ETA = <Colors color="white">Weak2:<Colors color="yellow"> <Timer countdown={weakTime + cycleEndStart} startTime={Date.now()} /></Colors></Colors>;

		ns.clearLog();
		ns.printRaw(<Colors color="white"> Threads: </Colors>);
		ns.printRaw(<Colors color="white"> Hack: <Colors color="cyan">{hackThreads}</Colors> | Weak1: <Colors color="cyan">{weak1Threads}</Colors> | Grow: <Colors color="cyan">{growthThreads}</Colors> | Weak2: <Colors color="cyan">{weak2Threads}</Colors></Colors>);
		ns.printRaw(<> {hackETA} | {weak1ETA} | {growETA} | {weak2ETA}</>);

		await ns.asleep(weakTime + cycleEndStart + (gap * 2));
	}
}