import { Color, progressBar, FiraCodeLoading } from "helpers/Functions";

// Variables, change at will
const buyingWeapons = false;
const buyingArmor = false;
const buyingVehicles = false;
const buyingRootkits = false;
const buyingAugmentations = true;
const RESPECT_BEFORE_MONEY = 100000; // 100k
const TRAINING_THRESHOLD = 1000;
const MAX_ASCENSION_MULTIPLIER = 128;

// Constants, don't change
const warTick = 9;
const HackAugs = ["DataJack", "Neuralstimulator", "BitWire"];
const Rootkits = ["NUKE Rootkit", "Soulstealer Rootkit", "Demon Rootkit", "Hmap Node", "Jack the Ripper"];
const CrimeAugs = ["Bionic Spine", "Bionic Arms", "Bionic Legs", "Graphene Bone Lacings", "Synthetic Heart", "BrachiBlades", "Nanofiber Weave", "Synfibril Muscle"];
const Weapons = ["Baseball Bat", "Katana", "Glock 18C", "P90C", "Steyr AUG", "AK-47", "M15A10 Assault Rifle", "AWM Sniper Rifle"];
const Armor = ["Liquid Body Armor", "Bulletproof Vest", "Full Body Armor", "Graphene Plating Armor"];
const Vehicles = ["Ford Flex V20", "White Ferrari", "ATX1070 Superbike", "Mercedes-Benz S9001"];

// https://www.fantasynamegenerators.com/
const HackerNames = ["B00TSTR4P", "PR0T0C4LL", "CR4CK3D", "INST4LL3R", "SP1D3R", "L3G4CY", "GH0ST", "BYT3BURN3R", "ALG0R1THM", "D3BUG", "B1TCL0UD", "T3RM1N4L"];
const CriminalNames = ["Fang", "Dawn", "Storm", "Crusher", "Red", "Bone", "Claw", "Beak", "Doom", "Talon", "Ryder", "Mantle"];

const warfare = "Territory Warfare"; // Territory Warfare
const idle = "Unassigned"; // Unassigned

// Variable Constants, these get changed at runtime
let isHacking = true;
let topEarner = ""; // Best Money
let topRespect = ""; // Best Respect
let topVirtuous = ""; // Best wanted removal
let trainStat = "";
let currentTick = -1;
let maxPrepCount = 0;


// Recruit a new prospect to a full gang member.
/** @param {NS} ns */
async function recruitMember(ns, MemberNames){
	const currentMembers = ns.gang.getMemberNames();
	const availableNames = MemberNames.filter(x => !currentMembers.includes(x));
	ns.gang.recruitMember(availableNames[0]);
	ns.gang.setMemberTask(availableNames[0], trainStat); // Set to train initially.
	await ns.sleep(50);
}


// Attempt to assign Gang Member specified tasks
/** @param {NS} ns */
function assignJob(ns, member, skillLevel){
	const memberInfo = ns.gang.getMemberInformation(member);
	const gangInfo = ns.gang.getGangInformation();

	const wantedLevel = memberInfo.wantedLevelGain;
	const earnedRespect = memberInfo.earnedRespect;

	let task = idle;


	// Skill Training
	if(skillLevel < TRAINING_THRESHOLD) return ns.gang.setMemberTask(member, trainStat);

	task = topRespect; // Generate Respect
	if(earnedRespect > RESPECT_BEFORE_MONEY) task = topEarner; // Make Money

	if(wantedLevel >= 100) task = topVirtuous; // Vigilante Justice
	if(!isHacking){
		if(gangInfo.territory < 1 && ns.gang.getMemberNames().length === 12){
			const foundTickAndShouldWar = (currentTick === warTick);
			const unknownTick = (earnedRespect > RESPECT_BEFORE_MONEY && currentTick === -1);
			if(foundTickAndShouldWar || unknownTick) task = warfare; // Increase Power
		}
	}

	// Assign task and we're gucci
	return ns.gang.setMemberTask(member, task);
}


/** @param {NS} ns */
function prepareMember(ns, name){
	if(isHacking){ // If we're a hacking gang, we only care about hacking augments and rootkits
		const memberInformation = ns.gang.getMemberInformation(name);
		if(buyingAugmentations){ // Augments
			for(const item of HackAugs){
				if(memberInformation.augmentations.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money){

					const purchased = ns.gang.purchaseEquipment(name, item);
					if(purchased){
						ns.toast(`${name} bought ${item} (💲${ns.formatNumber(ns.gang.getEquipmentCost(item))})`, "info", 8000);
					}
				}
			}
		}

		if(buyingRootkits){ // Rootkits
			for(const item of Rootkits){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money){

					const purchased = ns.gang.purchaseEquipment(name, item);
					if(purchased){
						ns.toast(`${name} bought ${item} (💲${ns.formatNumber(ns.gang.getEquipmentCost(item))})`, "info", 8000);
					}
				}
			}
		}
	}


	if(!isHacking){ // If we're not a hacking gang, we have a bunch of other stuff we might care about.
		const memberInformation = ns.gang.getMemberInformation(name);
		if(buyingAugmentations){ // Augments
			for(const item of CrimeAugs){
				if(memberInformation.augmentations.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money){

					const purchased = ns.gang.purchaseEquipment(name, item);
					if(purchased){
						ns.toast(`${name} bought ${item} (💲${ns.formatNumber(ns.gang.getEquipmentCost(item))})`, "info", 8000);
					}
				}
			}
		}

		if(buyingWeapons){ // Weapons
			for(const item of Weapons){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money){

					const purchased = ns.gang.purchaseEquipment(name, item);
					if(purchased){
						ns.toast(`${name} bought ${item} (💲${ns.formatNumber(ns.gang.getEquipmentCost(item))})`, "info", 8000);
					}
				}
			}
		}

		if(buyingArmor){ // Armor
			for(const item of Armor){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money){

					const purchased = ns.gang.purchaseEquipment(name, item);
					if(purchased){
						ns.toast(`${name} bought ${item} (💲${ns.formatNumber(ns.gang.getEquipmentCost(item))})`, "info", 8000);
					}
				}
			}
		}

		if(buyingVehicles){ // Vehicles
			for(const item of Vehicles){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money){

					const purchased = ns.gang.purchaseEquipment(name, item);
					if(purchased){
						ns.toast(`${name} bought ${item} (💲${ns.formatNumber(ns.gang.getEquipmentCost(item))})`, "info", 8000);
					}
				}
			}
		}
	}

	const memberInformation = ns.gang.getMemberInformation(name);
}


/**
General gang action plan:
	Gain Respect
		-> 12 members
			-> power
				-> all win chances > 55%
				-> if engage in territory warfare is on
					-> power/money (keep win chances > 55%)
						-> territory 100%
							-> gain money/rep
---------------------------------------------------------------
* @param {NS} ns */
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();
	ns.ui.openTail();
	ns.ui.setTailTitle("\u200b Gang Manager");
	if(ns.gang.getGangInformation().territory === 1) ns.ui.closeTail();

	currentTick = -1;

	if(!ns.gang.inGang()) throw "You are not currently in a gang!";
	isHacking = ns.gang.getGangInformation().isHacking;

	maxPrepCount = 0;
	if(buyingWeapons) maxPrepCount += Weapons.length;
	if(buyingArmor) maxPrepCount += Armor.length;
	if(buyingArmor) maxPrepCount += Vehicles.length;
	if(buyingAugmentations && !isHacking) maxPrepCount += CrimeAugs.length;
	if(buyingAugmentations && isHacking) maxPrepCount += HackAugs.length;
	if(buyingRootkits && isHacking) maxPrepCount += Rootkits.length;

	let maxRespect = 0;

	const MemberNames = (isHacking) ? HackerNames : CriminalNames;
	topEarner = (isHacking) ? "Money Laundering" : "Human Trafficking"; // Get Money
	// topEarner = (isHacking) ? "Money Laundering" : "Traffick Illegal Arms"; // Get Money
	topRespect = (isHacking) ? "Cyberterrorism" : "Terrorism"; // Get Respect
	trainStat = (isHacking) ? "Train Hacking" : "Train Combat";
	topVirtuous = "Vigilante Justice";
	const startPower = ns.gang.getGangInformation().power;
	let foundWartick = false;
	// Engine
	while(true){
		if(ns.gang.getGangInformation().power !== startPower && !foundWartick) foundWartick = true;
		if(foundWartick) currentTick = (currentTick + 1) % 10;

		ns.ui.setTailTitle(`\u200b Gang Manager (Tick: ${currentTick})`);
		const members = ns.gang.getMemberNames();

		const otherGangs = ns.gang.getOtherGangInformation();
		let lowestChance = 1;
		for(const gang in otherGangs){
			if(gang === ns.gang.getGangInformation(gang).faction) continue; // This is us
			lowestChance = Math.min(ns.gang.getChanceToWinClash(gang), lowestChance);
		}

		ns.gang.setTerritoryWarfare((ns.gang.getGangInformation().territory < 1 && lowestChance >= 0.6 && members.length === 12));

		const money = ns.getServerMoneyAvailable("home");
		const gangInfo = ns.gang.getGangInformation();
		const gangIncome = ns.gang.getGangInformation().moneyGainRate * 5; // A tick is every 200ms. To get the actual money/sec, multiple moneyGainRate by 5.
		const gangRespect = ns.formatNumber(ns.gang.getGangInformation().respect);
		const nextRecruit = ns.formatNumber(ns.gang.respectForNextRecruit());

		const prospects = MemberNames.filter(c => !members.includes(c));
		const tickLog = [];

		tickLog.push(` 🌆 Gang:                ${Color.set(gangInfo.faction, Color.preset.orange)} ${isHacking ? "💻" : "⚔️"}`);
		tickLog.push(" 🏦 Money Available:     " + Color.set(`$${ns.formatNumber(money)}`, Color.preset.lime));
		tickLog.push(" 💵 Gang Income/sec:     " + Color.set(`$${ns.formatNumber(gangIncome)}`, Color.preset.lime));
		tickLog.push(" 🦾 Gang Respect:        " + Color.set(gangRespect, Color.preset.lightPurple));
		if(members.length < 12) tickLog.push(" 👤 Next Recruit:        " + Color.set(nextRecruit, Color.preset.lightRed));
		if(members.length === 12 && !isHacking){
			tickLog.push(" ⚡️ Gang Power:          " + Color.set(ns.formatNumber(gangInfo.power), Color.preset.yellow));

			let territoryPercentColor = Color.preset.lightRed;
			if(gangInfo.territory > 0.25) territoryPercentColor = Color.preset.orange;
			if(gangInfo.territory > 0.50) territoryPercentColor = Color.preset.yellow;
			if(gangInfo.territory > 0.75) territoryPercentColor = Color.preset.lightGreen;
			if(gangInfo.territory === 1) territoryPercentColor = Color.preset.cyan;

			const barColor = (gangInfo.territoryWarfareEngaged) ? Color.preset.lightRed : Color.preset.white;
			const lockEmoji = (gangInfo.territoryWarfareEngaged) ? "🔑" : "🔒";

			const territoryBar = Color.set(progressBar(gangInfo.territory, FiraCodeLoading.filled, FiraCodeLoading.empty), barColor);
			const territoryPercent = Color.set(ns.formatPercent(gangInfo.territory, 3), territoryPercentColor);
			tickLog.push(` 🚩 Territory:           ${territoryBar}${lockEmoji} ${territoryPercent}`);
		}


		// Full Member
		tickLog.push(" ");
		tickLog.push(" 😈 Current Members:" + "\n");
		const activeTeam = members.join(", ");
		tickLog.push("    " + Color.set(activeTeam, Color.preset.lightBlue) + "\n");

		// Prospects
		if(ns.gang.getMemberNames().length < 12){
			tickLog.push(" ");
			tickLog.push(" 😐 Prospects:" + "\n");
			let notRecruited = ""; // reset
			notRecruited = prospects.join(", ");

			const awaitingRecruitment = "    " + Color.set(notRecruited, Color.preset.lightOrange) + "\n";
			tickLog.push(awaitingRecruitment);
		}

		if(gangInfo.respect > maxRespect) maxRespect = gangInfo.respect;
		// const minRespect = maxRespect * 0.75;s

		if(ns.gang.canRecruitMember()) await recruitMember(ns, MemberNames);


		// Sort members from highest to lowest respect gained.
		const memberSort = members.sort((b, a) => ns.gang.getMemberInformation(a).earnedRespect - ns.gang.getMemberInformation(b).earnedRespect);

		// SHOW STATS
		tickLog.push(" ");
		tickLog.push(" 👥 Members, sorted by highest respect:");
		for(let i = 0; i < memberSort.length; i++){
			const level = isHacking ? ns.gang.getMemberInformation(memberSort[i]).hack : ns.gang.getMemberInformation(memberSort[i]).dex;

			// Give Assignment
			assignJob(ns, memberSort[i], level);
		}


		// Prep
		let longestName = 0;
		let longestSkill = 0;
		let longestWanted = 0;
		let longestRespect = 0;
		let longestTask = 0;
		for(const member of members){
			const mem = ns.gang.getMemberInformation(member);

			const wanted = mem.wantedLevelGain.toFixed(4);
			const skillLevel = (isHacking) ? ns.formatNumber(mem.hack, 3, 1000, true) : ns.formatNumber(mem.dex, 3, 1000, true);
			const respect = ns.formatNumber(mem.earnedRespect, 3, 1000, true);
			const task = mem.task;

			longestName = Math.max(member.length, longestName);
			longestSkill = Math.max(skillLevel.length, longestSkill);
			longestWanted = Math.max(wanted.length, longestWanted);
			longestRespect = Math.max(respect.length, longestRespect);
			longestTask = Math.max(task.length, longestTask);
		}


		for(const member of members){
			const mem = ns.gang.getMemberInformation(member);
			const name = Color.set(member.padStart(longestName + 1, " "), Color.preset.lightBlue);

			const hackOrStrength = (isHacking) ? "💻 Hack:" : "💪 DEX:";
			const skillLevel = (isHacking) ? ns.formatNumber(mem.hack, 3, 1000, true) : ns.formatNumber(mem.dex, 3, 1000, true);
			const skill = Color.set(skillLevel.padStart(longestSkill, " "), Color.preset.lightYellow);
			const wanted = Color.set(mem.wantedLevelGain.toFixed(4).padStart(longestWanted, " "), Color.preset.lightYellow);
			const respect = Color.set(ns.formatNumber(mem.earnedRespect, 3, 1000, true).padStart(longestRespect, " "), Color.preset.lightYellow);
			const task = Color.set(mem.task.padEnd(longestTask + 1, " "), Color.preset.lightGreen);

			// Fang: 💪 DEX: 11203, 👮 Wanted: 0.0003, 🦾 Respect:  54.947m, 💼 Task: Human Trafficking
			const line = `${name}: ${hackOrStrength} ${skill}, 👮 Wanted: ${wanted}, 🦾 Respect: ${respect}, 💼 Task: ${task}`;
			tickLog.push(line);
		}


		// ASCEND & PREP
		let longest = 0;
		let highestMult = 0;

		for(const member of members){
			longest = Math.max(member.length, longest);

			const memberInfo = ns.gang.getMemberInformation(member);
			const memberMult = (isHacking) ? memberInfo.hack_asc_mult : memberInfo.dex_asc_mult;
			highestMult = Math.max(memberMult, highestMult);
		};

		const multLength = Math.round(highestMult).toString().length;

		tickLog.push(" ");
		tickLog.push(" 👑 Ascension, sorted by ascension:");

		const lbracket = Color.set("[", Color.preset.lightGray);
		const rbracket = Color.set("]", Color.preset.lightGray);

		members.sort((a, b) => {
			const aInfo = ns.gang.getAscensionResult(a);
			const bInfo = ns.gang.getAscensionResult(b);

			// Sometimes ascension result is undefined..
			// So, Short-Circuit evaluation + optional chaining.
			const aMult = (isHacking) ? aInfo?.hack || 0 : aInfo?.dex || 0;
			const bMult = (isHacking) ? bInfo?.hack || 0 : bInfo?.dex || 0;

			return bMult - aMult;
		});

		for(const mem of members){

			let prepping = "✔️";
			const member_name = Color.set(mem.padStart(longest + 1, " "), Color.preset.lightBlue) ;

			// Member Prepping
			prepareMember(ns, mem);

			try { // Member Ascension
				const memberInfo = ns.gang.getMemberInformation(mem); // Get entire gang member object from name.
				const ascResult = ns.gang.getAscensionResult(mem); // Get the result of an ascension without ascending.

				if(ascResult != undefined){
					const ascResType = (isHacking) ? "hack" : "dex";
					const memCurrentMult = (isHacking) ? "hack_asc_mult" : "dex_asc_mult";

					const current_Mult = memberInfo[memCurrentMult];
					const currentAscMul = ascResult[ascResType];
					const multThreshold = 2;

					const doAsc = (currentAscMul >= 2); // Double the current ascension bonus, this takes longer but when they ascend they're that much stronger

					const readyText = doAsc ? Color.set("  Level Up!  ", Color.preset.lime) : Color.set(" XP Required ", Color.preset.gray);
					const curMultColor = doAsc ? Color.preset.green : Color.preset.lightOrange;
					const curMult = Color.set(currentAscMul.toFixed(5), curMultColor);
					const symbol = doAsc ? "≥" : "<";
					const ascThreshold = Color.set(multThreshold.toFixed(2), Color.preset.lightPurple);
					const multiplier = `\u0078${ns.formatNumber(current_Mult, 0, 1000000)}`.padStart(multLength + 1);
					const multi = `(${Color.set(multiplier, Color.preset.lightYellow)})`;

					if(!prepping){ // If is an empty string
						const totalUpgrades = memberInfo.augmentations.length + memberInfo.upgrades.length;
						prepping = `${Color.set(totalUpgrades, Color.preset.lightRed)}/${Color.set(maxPrepCount, Color.preset.green)}`;
					}

					const output = `${member_name} ${multi}: ${curMult} ${symbol} ${ascThreshold}  -  ${lbracket}${readyText}${rbracket} ${prepping}`;
					tickLog.push(output);

					if(doAsc && memberInfo.respectGain / gangInfo.respect < 0.30 && current_Mult < MAX_ASCENSION_MULTIPLIER){ // Member will only ascend if they account for less than x% of the total respect
						await ns.sleep(50);
						ns.gang.ascendMember(mem);
					}
				}
			} catch (e){
				console.log(e);
			}
		}

		ns.clearLog();
		for(const line of tickLog){
			ns.print(line);
		}

		ns.ui.setTailFontSize(14);
		ns.ui.resizeTail(900, (22 * tickLog.length));

		await ns.gang.nextUpdate();
	}
}