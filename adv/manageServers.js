import { timeConvert } from "/adv/extra/timeConvert.js";
import { numberConvert } from "/adv/extra/numberConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.print("Script Started");
	const target = ns.args[0];

	ns.print("Script continuing in 5 seconds...");
	await ns.sleep(5000);
	ns.killall(target);

	if (!ns.hasRootAccess(target)) {
		ns.exec("/adv/extra/rootAccess.js", "home", 1, target);
		ns.print("No root access, attempting to gain access...");
		await ns.sleep(5000);
		if (!ns.hasRootAccess(target)) return ns.print("Unable to gain root access, ending script");
	}

	const serverMinSecurity = ns.getServerMinSecurityLevel(target);
	const serverMaxMoney = ns.getServerMaxMoney(target);

	if (serverMinSecurity < ns.getServerSecurityLevel(target)) { // Nuclear weaken
		ns.print(`Security is not at min, weakening before start | ETA: ${timeConvert(ns.getWeakenTime(target) + 5000)}`);
		ns.scriptKill(`/scripts/hack.js`, "home");
		ns.scriptKill(`/scripts/weaken.js`, "home");
		ns.scriptKill(`/scripts/grow.js`, "home");
		await ns.sleep(1000);

		const homeRAM = (ns.getServerMaxRam("home") - 8) - ns.getServerUsedRam("home");
		const homeMaxThreads = Math.floor(homeRAM / ns.getScriptRam(`/scripts/weaken.js`, "home"));

		if(homeMaxThreads > 0) ns.exec(`/scripts/weaken.js`, "home", homeMaxThreads, target);

		for (const server of ns.getPurchasedServers()) {
			// ns.print(server);
			ns.killall(server);
			await ns.sleep(100);
			const maxRAM = ns.getServerMaxRam(server);
			const maxThreads = Math.floor((maxRAM - 0.1) / ns.getScriptRam(`/scripts/weaken.js`, server));
			ns.exec(`/scripts/weaken.js`, server, maxThreads, target);
		}
		await ns.sleep(ns.getWeakenTime(target) + 5000);
	}

	const scriptSwap = async (type) => {
		let threadsReq = 0;
		switch (type) {
			case "weaken":
				const serverSec = ns.getServerSecurityLevel(target);
				let found = false;
				while (!found) {
					const security = serverSec - ns.weakenAnalyze(threadsReq);
					if (security <= serverMinSecurity) {
						found = true;
						break;
					}
					threadsReq += 1;
				}
				break;
			case "hack":
				threadsReq = ns.hackAnalyzeThreads(target, ns.getServerMoneyAvailable(target) * 0.75);
				break;
			case "grow":
				threadsReq = ns.growthAnalyze(target, serverMaxMoney / (ns.getServerMoneyAvailable(target) + 0.01)) + 1;
				break;
			default:
				ns.toast(`Error: Unknown Type: ${type} | ${ns.getScriptName}`, "error", 60000);
		}
		if (threadsReq <= 0) threadsReq = 1;
		threadsReq = Math.ceil(threadsReq);

		ns.scriptKill(`/scripts/hack.js`, "home");
		ns.scriptKill(`/scripts/weaken.js`, "home");
		ns.scriptKill(`/scripts/grow.js`, "home");
		await ns.sleep(1000);

		const homeRAM = (ns.getServerMaxRam("home") - 32) - ns.getServerUsedRam("home");
		const homeMaxThreads = Math.floor(homeRAM / ns.getScriptRam(`/scripts/${type}.js`, "home"));

		if (homeMaxThreads > 0) {
			const homeThreads = Math.min(threadsReq, homeMaxThreads);
			ns.exec(`/scripts/${type}.js`, "home", homeThreads, target);
			threadsReq -= homeThreads;
		}

		for (const server of ns.getPurchasedServers()) {
			const maxRAM = ns.getServerMaxRam(server);
			if (threadsReq > 0) {
				ns.killall(server);
				const maxThreads = (maxRAM - 0.1) / ns.getScriptRam(`/scripts/${type}.js`, server);
				const threads = Math.min(threadsReq, maxThreads);
				ns.exec(`/scripts/${type}.js`, server, threads, target);
				threadsReq -= threads;
				continue;
			}
			// if no script is running or is not the weaken script, start the weaken script
			if (!ns.scriptRunning("/script/weaken.js", server) || !ns.ps(server)[0].args.includes("foodnstuff")) {
				ns.killall(server);
				const weakenThreads = (maxRAM - 0.1) / ns.getScriptRam(`/scripts/weaken.js`, server);
				ns.exec(`/scripts/weaken.js`, server, weakenThreads, "joesguns");
			}
		}

		if (threadsReq > 0) ns.toast(`Lacking ${threadsReq} threads for ${type} on ${target}`, "warning", 10000);

		const currentMoney = ns.getServerMoneyAvailable(target);
		if (type === "hack") {
			while (ns.getServerMoneyAvailable(target) >= (currentMoney * 0.3)) {
				await ns.sleep(ns.getHackTime(target) + 5000);
				const decimalPercent = ns.getServerMoneyAvailable(target) / currentMoney;
				ns.print(`Total money hacked: $${numberConvert(Math.round(currentMoney - ns.getServerMoneyAvailable(target)))} (Remaining: ${100 - Math.round((decimalPercent + Number.EPSILON) * 100) / 100}%)`);
				//ns.print(`Current Money: $${Math.round(ns.getServerMoneyAvailable(target)).toLocaleString()} | Threshold: $${Math.round(currentMoney * 0.3).toLocaleString()}`)
			}
		}
	}

	while (true) {
		ns.print(`Starting Hack (${Math.round(ns.hackAnalyzeChance(target) * 100)}%) | ETA: ${timeConvert(ns.getHackTime(target) + 5000)}`);
		await scriptSwap("hack");

		// await ns.sleep(ns.getHackTime(target) + 5000);
		ns.print(`Starting Weaken (${Math.round((ns.getServerSecurityLevel(target) + Number.EPSILON) * 100) / 100}) | ETA: ${timeConvert(ns.getWeakenTime(target) + 5000)}`);
		await scriptSwap("weaken");
		await ns.sleep(ns.getWeakenTime(target) + 5000);

		ns.print(`Starting Grow ($${numberConvert(ns.getServerMoneyAvailable(target))}) | ETA: ${timeConvert(ns.getGrowTime(target) + 5000)}`);
		await scriptSwap("grow");
		await ns.sleep(ns.getGrowTime(target) + 5000);

		ns.print(`Starting Weaken (${Math.round((ns.getServerSecurityLevel(target) + Number.EPSILON) * 100) / 100}) | ETA: ${timeConvert(ns.getWeakenTime(target) + 5000)}`);
		await scriptSwap("weaken");
		await ns.sleep(ns.getWeakenTime(target) + 5000);
	}
} // grow, weaken, hack, weaken cycle with all Servers, no fancy bidness
