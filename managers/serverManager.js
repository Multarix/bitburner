import { gainRoot, timeConvert, serverSort } from "/helpers/Functions.js";
import { Timer } from "jsx/Timer.jsx";
import { Colors } from "jsx/Colors.jsx";
import { numberConvert } from "helpers/Functions";

const margin = 2000;


function doLogging(ns, actionETA, target, subStr, stage){
	const timer = <Colors color="cyan"><Timer countdown={actionETA} startTime={Date.now()}></Timer></Colors>;
	const totalTime = <><Colors color="white">[</Colors><Colors color="lime">{timeConvert(actionETA)}</Colors><Colors color="white">]</Colors></>;
	const timeInfo = <>{timer} {totalTime}</>;
	ns.printRaw(<><Colors color="yellow"> {target}</Colors> <Colors color="white">-</Colors> <WGWH stage={stage}/> <Colors color="white">|</Colors> {timeInfo}</>);
	ns.ui.setTailTitle(<Colors color="white"> {target} ${numberConvert(ns.getServerMaxMoney(target))} | {subStr} | <Timer countdown={actionETA} startTime={Date.now()}></Timer> [{timeConvert(actionETA)}]</Colors>);
}


/** @param {NS} ns */
async function threadManager(ns, type, target){
	const minSecurity = ns.getServerMinSecurityLevel(target);
	const maxMoney = ns.getServerMaxMoney(target);
	const availMoney = ns.getServerMoneyAvailable(target);
	const cores = ns.getServer().cores;

	const optimalTake = maxMoney * 0.45; // Always aim for 45% of the max money
	const moneyToTake = (optimalTake * 1.5 > availMoney) ? optimalTake : availMoney * 0.45; // Take 45% of the available money, or 45% of max money

	const script = `/scripts/single/${type}.js`;
	const scriptRAM = ns.getScriptRam(script);


	let requiredThreads = 1;
	if(type === "weaken"){
		// @ignore-infinite
		while(true){
			const securityLevel = ns.getServerSecurityLevel(target);
			const weakenDecrease = ns.weakenAnalyze(requiredThreads, 1);
			if(securityLevel - weakenDecrease <= minSecurity) break;
			requiredThreads += 1;
		}

		requiredThreads += 1; // An extra for good luck
	}

	if(type === "grow") requiredThreads += Math.max(ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), maxMoney, cores), 1); // Math.max here in case of a failed hack
	if(type === "hack") requiredThreads += Math.max(Math.ceil(ns.hackAnalyzeThreads(target, moneyToTake)), 1);

	const purchasedServers = ns.getPurchasedServers().sort(serverSort);
	if(purchasedServers.length === 0) purchasedServers.push("home");

	for(const server of purchasedServers){
		if(server !== "home") ns.killall(server);
	}

	await ns.sleep(3000);

	for(const server of purchasedServers){
		if(server !== "home") ns.killall(server);

		const serverRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
		const maxThreads = Math.floor((serverRAM - 0.1) / scriptRAM);
		const threadsToUse = Math.min(maxThreads, requiredThreads);

		if(requiredThreads > 0){
			ns.exec(script, server, threadsToUse, target);
			requiredThreads -= threadsToUse;

			if(requiredThreads <= 0 && server !== "home") ns.exec("/managers/shareManager.js", server);
			continue;
		}

		if(server !== "home"){
			const num = parseInt(server.split("-")[1]);

			// Evens share ram, odds boost exp
			if(num % 2 === 0) ns.exec("/managers/shareManager.js", server);
			if(num % 2 === 1){
				const weakenScript = "/scripts/repeat/weaken.js";
				ns.exec("/scripts/repeat/weaken.js", server, maxThreads, "foodnstuff");
			}
		}
	}

	if(requiredThreads > 0) ns.printRaw(<Colors color="yellow">Missing {requiredThreads} for {type} on {target}!</Colors>);
}


function WGWH(props){
	if(props.stage === "w") return <Colors color="red"><Colors color="lime">W</Colors>GWH</Colors>;
	if(props.stage === "wg") return <Colors color="red">W<Colors color="lime">G</Colors>WH</Colors>;
	if(props.stage === "wgw") return <Colors color="red">WG<Colors color="lime">W</Colors>H</Colors>;
	if(props.stage === "wgwh") return <Colors color="red">WGW<Colors color="lime">H</Colors></Colors>;
}


/** @param {NS} ns */
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	ns.ui.openTail();
	ns.ui.resizeTail(600, 150);
	const [winX, winY] = ns.ui.windowSize();
	ns.ui.moveTail(winX - 820, 250);

	ns.ui.setTailTitle(<Colors color="white">Server Manager | Starting</Colors>);
	ns.printRaw(<Colors color="lime">Script Starting!</Colors>);

	while(!ns.peek(1)){
		ns.writePort(2, true);
		await ns.sleep(1000);
	}

	let lastTarget = ns.args[0];
	while(true){
		let setupTarget = ns.peek(20);
		if(setupTarget === "NULL PORT DATA"){
			setupTarget = lastTarget;
			ns.writePort(20, setupTarget);
		};

		if(!ns.hasRootAccess(setupTarget)){
			gainRoot(ns, setupTarget);
			await ns.sleep(margin);
		}

		if(!ns.hasRootAccess(setupTarget)){
			ns.printRaw(<><Colors color="red">Do not have root access on </Colors><Colors color="yellow">{setupTarget}</Colors><Colors color="red">! Swapping to backup target!</Colors></>);
			setupTarget = "foodnstuff";
		}

		const target = setupTarget;

		ns.killall(target);
		await ns.sleep(margin);

		const minSecurity = ns.getServerMinSecurityLevel(target);
		const maxMoney = ns.getServerMaxMoney(target);
		const moneyGrowThreshold = maxMoney * 0.95;
		const moneyStolenThreshold = maxMoney * 0.60;

		// ns.print(`weaken | ${ns.getServerSecurityLevel(target)} > ${minSecurity} | ${ns.getServerSecurityLevel(target) > minSecurity}`);
		while(ns.getServerSecurityLevel(target) > minSecurity){
			ns.killall(target);
			await threadManager(ns, "weaken", target);

			const actionETA = ns.getWeakenTime(target);
			doLogging(ns, actionETA, target, "Weakening", "w");
			await ns.asleep(actionETA + margin);
		}


		// ns.print(`grow | ${ns.getServerMoneyAvailable(target)} <= ${moneyGrowThreshold} | ${ns.getServerMoneyAvailable(target) <= moneyGrowThreshold}`);
		while(ns.getServerMoneyAvailable(target) <= moneyGrowThreshold){
			ns.killall(target);
			await threadManager(ns, "grow", target);

			const actionETA = ns.getGrowTime(target);
			doLogging(ns, actionETA, target, "Growing", "wg");
			await ns.asleep(actionETA + margin);
		}

		// ns.print(`weaken2 | ${ns.getServerSecurityLevel(target)} > ${minSecurity} | ${ns.getServerSecurityLevel(target) > minSecurity}`);
		while(ns.getServerSecurityLevel(target) > minSecurity){
			ns.killall(target);
			await threadManager(ns, "weaken", target);

			const actionETA = ns.getWeakenTime(target);
			doLogging(ns, actionETA, target, "Weakening", "wgw");
			await ns.asleep(actionETA + margin);
		}

		// ns.print(`hack | ${ns.getServerMoneyAvailable(target)} > ${moneyStolenThreshold} | ${ns.getServerMoneyAvailable(target) > moneyStolenThreshold}`);
		while(ns.getServerMoneyAvailable(target) > moneyStolenThreshold){
			ns.killall(target);
			await threadManager(ns, "hack", target);

			const actionETA = ns.getHackTime(target);
			doLogging(ns, actionETA, target, "Hacking", "wgwh");
			await ns.asleep(actionETA + margin);
		}

		lastTarget = target;
	}
}