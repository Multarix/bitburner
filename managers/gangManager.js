import { Color, progressBar, FiraCodeLoading } from "helpers/Functions";

// Variables, change at will
const buyingWeapons = true;
const buyingArmor = true;
const buyingVehicles = true;
const buyingRootkits = false;
const buyingAugmentations = true;
const RESPECT_BEFORE_MONEY = 4000000000;
const TRAINING_THRESHOLD = 500;
const MAX_ASCENSION_MULTIPLIER = 100;

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

const memberPrepped = [];
const membersAscended = [];
const memberStats = [];

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



function getAscendThreshold(mult){
	if(mult < 1.632) return 1.6326;
	if(mult < 2.336) return 1.4315;
	if(mult < 2.999) return 1.284;
	if(mult < 3.363) return 1.2125;
	if(mult < 4.253) return 1.1698;
	if(mult < 4.860) return 1.1428;
	if(mult < 5.455) return 1.1225;
	if(mult < 5.977) return 1.0957;
	if(mult < 6.496) return 1.0869;
	if(mult < 7.008) return 1.0789;
	if(mult < 7.519) return 1.073;
	if(mult < 8.025) return 1.0673;
	if(mult < 8.513) return 1.0631;
	return 1.0591;
}



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

	// GET STATS
	memberStats.push(member + "|" + wantedLevel);
	memberStats.push(member + "|" + earnedRespect);

	// Skill Training
	if(skillLevel < TRAINING_THRESHOLD){
		ns.gang.setMemberTask(member, trainStat);
		return memberStats.push(member + "|" + trainStat);
	}

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
	ns.gang.setMemberTask(member, task);
	return memberStats.push(member + "|" + task);
}


/** @param {NS} ns */
function prepareMember(ns, name){
	if(isHacking){ // If we're a hacking gang, we only care about hacking augments and rootkits
		const memberInformation = ns.gang.getMemberInformation(name);
		if(buyingAugmentations){ // Augments
			for(const item of HackAugs){
				if(memberInformation.augmentations.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money) ns.gang.purchaseEquipment(name, item);
			}
		}

		if(buyingRootkits){ // Rootkits
			for(const item of Rootkits){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money) ns.gang.purchaseEquipment(name, item);
			}
		}
	}


	if(!isHacking){ // If we're not a hacking gang, we have a bunch of other stuff we might care about.
		const memberInformation = ns.gang.getMemberInformation(name);
		if(buyingAugmentations){ // Augments
			for(const item of CrimeAugs){
				if(memberInformation.augmentations.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money) ns.gang.purchaseEquipment(name, item);
			}
		}

		if(buyingWeapons){ // Weapons
			for(const item of Weapons){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money) ns.gang.purchaseEquipment(name, item);
			}
		}

		if(buyingArmor){ // Armor
			for(const item of Armor){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money) ns.gang.purchaseEquipment(name, item);
			}
		}

		if(buyingVehicles){ // Vehicles
			for(const item of Vehicles){
				if(memberInformation.upgrades.includes(item)) continue;
				if(ns.gang.getEquipmentCost(item) < ns.getPlayer().money) ns.gang.purchaseEquipment(name, item);
			}
		}
	}

	const memberInformation = ns.gang.getMemberInformation(name);
	if(memberInformation.augmentations.length + memberInformation.upgrades.length >= maxPrepCount) memberPrepped.push(name);
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
	memberPrepped.splice(0, memberPrepped.length);
	membersAscended.splice(0, membersAscended.length);
	memberStats.splice(0, memberStats.length);

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

		ns.ui.setTailFontSize(14);
		ns.ui.resizeTail(1035, 860);
		ns.clearLog();

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

		ns.print(` 🌆 Gang:                ${Color.set(gangInfo.faction, Color.preset.orange)} ${isHacking ? "💻" : "⚔️"}`);
		ns.print(" 🏦 Money Available:     " + Color.set(`$${ns.formatNumber(money)}`, Color.preset.lime));
		ns.print(" 💵 Gang Income/sec:     " + Color.set(`$${ns.formatNumber(gangIncome)}`, Color.preset.lime));
		ns.print(" 🦾 Gang Respect:        " + Color.set(gangRespect, Color.preset.lightPurple));
		if(members.length < 12) ns.print(" 👤 Next Recruit:        " + Color.set(nextRecruit, Color.preset.red));
		if(members.length === 12 && !isHacking){
			ns.print(" ⚡️ Gang Power:          " + Color.set(ns.formatNumber(gangInfo.power), Color.preset.yellow));

			let territoryPercentColor = Color.preset.red;
			if(gangInfo.territory > 0.25) territoryPercentColor = Color.preset.orange;
			if(gangInfo.territory > 0.50) territoryPercentColor = Color.preset.yellow;
			if(gangInfo.territory > 0.75) territoryPercentColor = Color.preset.lightGreen;
			if(gangInfo.territory === 1) territoryPercentColor = Color.preset.cyan;

			const barColor = (gangInfo.territoryWarfareEngaged) ? Color.preset.red : Color.preset.white;
			const lockEmoji = (gangInfo.territoryWarfareEngaged) ? "🔑" : "🔒";

			const territoryBar = Color.set(progressBar(gangInfo.territory, FiraCodeLoading.filled, FiraCodeLoading.empty), barColor);
			const territoryPercent = Color.set(ns.formatPercent(gangInfo.territory, 3), territoryPercentColor);
			ns.print(` 🚩 Territory:           ${territoryBar}${lockEmoji} ${territoryPercent}`);
		}


		// Full Member
		ns.print("\n" + " 😈 Current Members:" + "\n");
		const activeteam = members.join(", ");
		ns.print("    " + Color.set(activeteam, Color.preset.lightBlue) + "\n");

		// Prospects
		if(ns.gang.getMemberNames().length < 12){
			ns.print("\n" + " 😐 Prospects:" + "\n");
			let waitteam = ""; // reset
			waitteam = prospects.join(", ");

			const msg = "    " + Color.set(waitteam, Color.preset.lightOrange) + "\n";
			ns.print(msg);
		}

		if(gangInfo.respect > maxRespect) maxRespect = gangInfo.respect;
		// const minRespect = maxRespect * 0.75;s

		if(ns.gang.canRecruitMember()){
			ns.print("\n" + " Recruiting new prospect..." + "\n");
			await recruitMember(ns, MemberNames);
		}

		// Sort members from highest to lowest respect gained.
		const memberSort = members.sort((b, a) => ns.gang.getMemberInformation(a).earnedRespect - ns.gang.getMemberInformation(b).earnedRespect);

		// SHOW STATS
		ns.print("\n");
		ns.print(" 👥 Members, sorted by highest respect:");
		for(let i = 0; i < memberSort.length; i++){
			const level = isHacking ? ns.gang.getMemberInformation(memberSort[i]).hack : ns.gang.getMemberInformation(memberSort[i]).dex;

			memberStats.push(memberSort[i] + "|" + level);

			// Give Assignment
			assignJob(ns, memberSort[i], level);
		}

		// MEMBER STATS
		let memberDataObj = {}; // Initialize empty object to store data
		const memberData = []; // Initialize empty array to store final data

		let longest0 = 0;
		let longest1 = 0;
		let longest2 = 0;
		let longest3 = 0;
		let longest4 = 0;
		let longest5 = 0;

		for(const member of members){
			const mem = ns.gang.getMemberInformation(member);
			const wanted = mem.wantedLevelGain.toFixed(4);
			longest5 = Math.max(wanted.length, longest5);
		}

		// Loop through each record in _memberStats array
		for(let i = 0; i < memberStats.length; i++){
			const retval = memberStats[i] + ''; // Split each record into name and stat using the pipe symbol
			const record = retval.split("|");
			const name = record[0];
			const stat = record[1];

			// Check if name already exists in memberDataObj
			// eslint-disable-next-line no-prototype-builtins
			if(memberDataObj.hasOwnProperty(name)){
				memberDataObj[name] += "|" + stat; // If it exists, concatenate the stat with existing data
			} else {
				memberDataObj[name] = name + "|" + stat; // If it doesn't exist, create a new entry for the name in memberDataObj
			}
		}

		// Loop through memberDataObj and add each entry to memberData array
		for(const name in memberDataObj){
			memberData.push(memberDataObj[name]);
		}

		// Loop through to format
		memberData.forEach((e) => {
			const data = e + '';
			const splitStr = data.split("|");

			const name = splitStr[0];
			const hacklevel = splitStr[1];
			const wantedlevel = splitStr[2];
			const respect = splitStr[3];
			const task = splitStr[4];

			longest0 = Math.max(name.length, longest0);
			longest1 = Math.max(hacklevel.length, longest1);
			longest2 = Math.max(wantedlevel.length, longest2);
			longest3 = Math.max(respect.length, longest3);
			longest4 = Math.max(task.length, longest4);
		});

		// Show it.
		memberData.forEach((e) => {
			const data = e + '';
			const splitStr = data.split("|");

			const name = splitStr[0];
			const hacklevel = splitStr[1];
			const wantedlevel = splitStr[2];
			const respect = splitStr[3];
			const task = splitStr[4];

			const num0 = parseFloat(wantedlevel).toFixed(4);
			const num1 = (parseInt(respect) >= 1000) ? ns.formatNumber(parseInt(respect), 3, 1000) : parseInt(respect).toFixed(0);

			const hackOrStrength = (isHacking) ? ": 💻 Hack: " : ": 💪 DEX: ";

			ns.print(Color.set(name.padStart(longest0 + 1, " "), Color.preset.lightBlue)
                + hackOrStrength + Color.set(hacklevel.padStart(longest1, " "), Color.preset.lightYellow)
                + ", 👮 Wanted: " + Color.set(num0.padStart(longest5, " "), Color.preset.lightYellow)
                + ", 🦾 Respect: " + Color.set(num1.padStart(8, " "), Color.preset.lightYellow)
                + ", 💼 Task: " + Color.set(task.padEnd(longest4 + 1, " "), Color.preset.lightGreen)
                + " \n");
		});

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

		ns.print("\n");
		ns.print(" 👑 Ascension, sorted by highest multiplier");

		const lbracket = Color.set("[", Color.preset.lightGray);
		const rbracket = Color.set("]", Color.preset.lightGray);

		members.sort((a, b) => {
			const aInfo = ns.gang.getMemberInformation(a);
			const bInfo = ns.gang.getMemberInformation(b);

			const aMult = (isHacking) ? aInfo.hack_asc_mult : aInfo.dex_asc_mult;
			const bMult = (isHacking) ? bInfo.hack_asc_mult : bInfo.dex_asc_mult;

			return bMult - aMult;
		});

		for(const mem of members){

			let prepping = `✔️`;
			const member_name = Color.set(mem.padStart(longest + 1, " "), Color.preset.lightBlue) ;

			// Member Prepping
			if(!memberPrepped.includes(mem.trim())){
				prepping = "";
				prepareMember(ns, mem);
			}

			try { // Member Ascension
				const memberInfo = ns.gang.getMemberInformation(mem); // Get entire gang member object from name.
				const ascResult = ns.gang.getAscensionResult(mem); // Get the result of an ascension without ascending.

				if(ascResult != undefined){
					const next_point_exp = (isHacking) ? memberInfo.hack_exp : memberInfo.dex_exp;
					const next_Point = Math.max(next_point_exp - 1000, 0); // Stolen from game source code, who need Formulas.exe anyway?
					// const next_Point = ns.formulas.gang.ascensionPointsGain(next_point_exp);

					const asc_points = (isHacking) ? memberInfo.hack_asc_points : memberInfo.dex_asc_points;
					const next_Mult_exp = asc_points + next_Point;
					const next_Mult = Math.max(Math.pow(next_Mult_exp / 2000, 0.5), 1); // Stolen from game source code, who need Formulas.exe anyway?
					// const next_Mult = ns.formulas.gang.ascensionMultiplier(next_Mult_exp);

					const current_Mult = (isHacking) ? memberInfo.hack_asc_mult : memberInfo.dex_asc_mult;

					const nxtmutlp_div_by_currentmultp = (next_Mult / current_Mult);
					const calculated_asc_threshold = getAscendThreshold(current_Mult);

					const doAsc = nxtmutlp_div_by_currentmultp >= calculated_asc_threshold;

					const readyText = doAsc ? Color.set("  Level Up!  ", Color.preset.lime) : Color.set(" XP Required ", Color.preset.gray);
					const curMultColor = doAsc ? Color.preset.green : Color.preset.red;
					const curMult = Color.set(nxtmutlp_div_by_currentmultp.toFixed(5), curMultColor);
					const symbol = doAsc ? "≥" : "<";
					const ascThreshold = Color.set(calculated_asc_threshold.toFixed(4), Color.preset.lightPurple);
					const multiplier = `\u0078${ns.formatNumber(current_Mult, 0, 1000000)}`.padStart(multLength + 1);
					const multi = `(${Color.set(multiplier, Color.preset.lightYellow)})`;

					if(!prepping){ // If is an empty string
						const totalUpgrades = memberInfo.augmentations.length + memberInfo.upgrades.length;
						prepping = `${Color.set(totalUpgrades, Color.preset.red)}/${Color.set(maxPrepCount, Color.preset.green)}`;
					}

					const output = `${member_name}:  ${curMult} ${symbol} ${ascThreshold} ${multi}  -  ${lbracket}${readyText}${rbracket} ${prepping}`;
					ns.print(output);

					/*
                        ASCEND
                        ------
                        Doing Ascend(_mem) here, because there is a glitch that prevents
                        the output string from displaying when Ascend(_mem)
                        is lumped into the 'else if (multchange >= 2.0){ ... }' conditional area.
                    */
					if(doAsc && MAX_ASCENSION_MULTIPLIER >= current_Mult){
						await ns.sleep(50);
						ns.gang.ascendMember(mem);
						membersAscended.push(mem);

						// As long as ascending doesn't drop us below x% of our max respect we've ever achieved, ascend
						// if(gangInfo.respect - memberInfo.earnedRespect > minRespect){
						// 	ns.gang.ascendMember(mem);
						// 	membersAscended.push(mem);
						// }
					}
				}
			} catch (e){
				console.log(e);
			}
		}

		// RESET ENVIRONMNENT
		memberDataObj = {};
		memberStats.length = 0;

		ns.print(" \n");
		await ns.gang.nextUpdate();
	}
}