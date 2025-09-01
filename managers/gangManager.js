import { numberConvert as FormatNumber } from "/helpers/Functions.js";
import { TextTransforms } from "/helpers/text-transform.js";

/** @param {NS} ns */
export async function main(ns){
	/*
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
	*/

	ns.disableLog("ALL");
	ns.clearLog();
	ns.ui.openTail();
	ns.ui.setTailTitle("Gang Manager");

	if(!ns.gang.inGang()) throw "You are not currently in a gang!";
	const isHacking = ns.gang.getGangInformation().isHacking;

	const buyingWeapons = false;
	const buyingArmor = false;
	const buyingVehicles = false;
	const buyingRootkits = false;
	const buyingAugmentations = true;
	const RESPECT_BEFORE_MONEY = 300000;

	const memberPrepped = [];
	const membersAscended = [];
	const memberStats = [];

	const delay = 100;

	const HackAugs = ["DataJack", "Neuralstimulator", "BitWire"];
	const Rootkits = ["NUKE Rootkit", "Soulstealer Rootkit", "Demon Rootkit", "Hmap Node", "Jack the Ripper"];
	const CrimeAugs = ["Bionic Spine", "Bionic Arms", "Bionic Legs", "Graphene Bone Lacings", "Synthetic Heart", "BrachiBlades", "Nanofiber Weave", "Synfibril Muscle"];
	const Weapons = ["Baseball Bat", "Katana", "Glock 18C", "P90C", "Steyr AUG", "AK-47", "M15A10 Assault Rifle", "AWM Sniper Rifle"];
	const Armor = ["Liquid Body Armor", "Bulletproof Vest", "Full Body Armor", "Graphene Plating Armor"];
	const Vehicles = ["Ford Flex V20", "White Ferrari", "ATX1070 Superbike", "Mercedes-Benz S9001"];

	const HackerNames = ["B00TSTR4P", "PR0T0C4LL", "CR4CK3D", "INST4LL3R", "SP1D3R", "L3G4CY", "GH0ST", "BYT3BURN3R", "ALG0R1THM", "D3BUG", "B1TCL0UD", "T3RM1N4L"];
	const CriminalNames = ["Nightfang", "Swiftbolt", "Stormblood", "Fireheart", "Redflayer", "Boneblade", "Bloodclaw", "Brighthair", "Doomthorn", "Wildsorrow", "Ryder", "Mantle"];
	const MemberNames = isHacking ? HackerNames : CriminalNames;

	/*
        https://www.fantasynamegenerators.com/cyberpunk-names.php
    */

	const topEarner = isHacking ? "Money Laundering" : "Unknown Money"; // Get Money
	const topRespect = isHacking ? "Cyberterrorism" : "Terrorism"; // Get Respect
	const topVirtuous = "Vigilante Justice";
	const trainStat = isHacking ? "Train Hacking" : "Train Combat";

	const warfare = "Territory Warfare"; // Territory Warfare
	const idle = "Unassigned"; // Unassigned


	// Engine
	while(true){
		ns.ui.setTailFontSize(14);
		ns.ui.resizeTail(1035, 860);
		ns.clearLog();

		const money = ns.getServerMoneyAvailable("home");
		const gangInfo = ns.gang.getGangInformation();
		const gangIncome = ns.gang.getGangInformation().moneyGainRate * 5; // A tick is every 200ms. To get the actual money/sec, multiple moneyGainRate by 5.
		const gangRespect = FormatNumber(ns.gang.getGangInformation().respect);
		const nextRecruit = FormatNumber(ns.gang.respectForNextRecruit());

		ns.print(` 🌆 Gang: ${TextTransforms.apply(gangInfo.faction, [TextTransforms.Color.Orange])} ${isHacking ? "💻" : "⚔️"}`);
		ns.print(" 🏦 Money Available: " + TextTransforms.apply("$" + FormatNumber(money), [TextTransforms.Color.LGreen]));
		ns.print(" 💵 Gang Income/sec: " + TextTransforms.apply("$" + FormatNumber(gangIncome), [TextTransforms.Color.LGreen]));
		ns.print(" 🦾 Gang Respect: " + TextTransforms.apply(gangRespect, [TextTransforms.Color.LPurple]));
		if(ns.gang.getMemberNames().length < 12) ns.print(" 🙍 Next Recruit: " + TextTransforms.apply(nextRecruit, [TextTransforms.Color.Red]));

		const members = ns.gang.getMemberNames();
		const prospects = MemberNames.filter(c => !members.includes(c));

		// FULL MEMBERS
		ns.print("\n" + " 😈 Current Members:" + "\n");
		const activeteam = members.join(", ");
		ns.print("    " + TextTransforms.apply(activeteam, [TextTransforms.Color.ChartsBlue]) + "\n");

		// PROSPECTS
		ns.print("\n" + " 😐 Prospects:" + "\n");
		let waitteam = ""; // reset
		waitteam = prospects.join(", ");

		let msg = "    " + TextTransforms.apply(waitteam, [TextTransforms.Color.LPurple]) + "\n";
		if(waitteam.length === 0) msg = "    Gang has been maxed out.\n";
		ns.print(msg);


		// RECRUIT
		if(ns.gang.canRecruitMember()){
			ns.print("\n" + " Recruiting new prospect..." + "\n");
			await RecruitProspect();
		}

		// Sort members from highest to lowest respect gained.
		const skillSort = members.sort((b, a) => ns.gang.getMemberInformation(a).earnedRespect - ns.gang.getMemberInformation(b).earnedRespect);

		// SHOW STATS
		ns.print("\n" + " ✨ Members sorted by Hack Skill Level:");
		for(let i = 0; i < skillSort.length; ++i){
			const level = isHacking ? ns.gang.getMemberInformation(skillSort[i]).hack : ns.gang.getMemberInformation(skillSort[i]).str;

			// ns.print("   " + "💻 " + skillSort[i] + ", Hack skill level: " + level + "");
			memberStats.push(skillSort[i] + "|" + level);

			// ASSIGN JOBS
			GiveAssignments(skillSort[i], level);
		}

		// MEMBER STATS
		let memberDataObj = {}; // Initialize empty object to store data
		const memberData = []; // Initialize empty array to store final data

		let longest0 = 0;
		let longest1 = 0;
		let longest2 = 0;
		let longest3 = 0;
		let longest4 = 0;

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
			const num1 = parseFloat(respect).toFixed(2);

			ns.print(TextTransforms.apply(name.padStart(longest0 + 1), [TextTransforms.Color.ChartsBlue])
                + ", 💻hack: " + TextTransforms.apply(hacklevel.padStart(longest1 + 1), [TextTransforms.Color.ChartsGreen])
                + ", 🕶️wanted: " + TextTransforms.apply(num0.padStart(9), [TextTransforms.Color.ChartsGreen])
                + ", 🦾respect: " + TextTransforms.apply(num1.padStart(9), [TextTransforms.Color.ChartsGreen])
                + ", 💵task: " + TextTransforms.apply(task.padStart(longest4 + 1), [TextTransforms.Color.ChartsGreen])
                + " \n");
		});

		// ASCEND & PREP
		let longest = 0;

		for(const member of members){
			longest = Math.max(member.length, longest);
		};

		ns.print("\n" + " ⬆ Ascension✨ & Prep🔪💣🛡️ stats: " + "\n");

		const lbracket = TextTransforms.apply("[", [TextTransforms.Color.ChartsGray]);
		const rbracket = TextTransforms.apply("]", [TextTransforms.Color.ChartsGray]);

		for(const mem of members){

			let prepping = "";
			let output = "";
			const member_name = "" + TextTransforms.apply(mem.padStart(longest + 1), [TextTransforms.Color.ChartsBlue]) + "";
			const numTimesAscended = NumberOfTimesAscended(membersAscended, mem);

			// PREP
			if(memberPrepped.includes(mem.trim())){
				// ALREADY PREPPED OUT
				prepping = " " + lbracket + TextTransforms.apply("Fully Prepped 🔪💣🛡️", [TextTransforms.Color.ChartsGreen]) + rbracket + "";
			} else {
				// PREP MEMBER
				prepping = " " + lbracket + TextTransforms.apply("✨Prepping✨", [TextTransforms.Color.ChartsGray]) + rbracket + "";
				Prepare(mem);
			}

			// ASCEND
			try {
				const memberInfo = ns.gang.getMemberInformation(mem); // Get entire gang meber onject from name.
				const ascResult = ns.gang.getAscensionResult(mem); // Get the result of an ascension without ascending.

				if(ascResult != undefined){
					const next_point_exp = memberInfo.hack_exp;
					const next_Point = Math.max(next_point_exp - 1000, 0); // Stolen from game source code, who need Formulas.exe anyway?
					// const next_Point = ns.formulas.gang.ascensionPointsGain(memberInfo.hack_exp);

					const next_Mult_exp = memberInfo.hack_asc_points + next_Point;
					const next_Mult = Math.max(Math.pow(next_Mult_exp / 2000, 0.5), 1); // Stolen from game source code, who need Formulas.exe anyway?
					// const next_Mult = ns.formulas.gang.ascensionMultiplier(memberInfo.hack_asc_points + next_Point);

					const current_Mult = memberInfo.hack_asc_mult;

					const nxtmutlp_div_by_currentmultp = (next_Mult / current_Mult);
					const calculated_asc_threshold = CalculateAscendTreshold(current_Mult);

					let doAsc = false;

					output = "times_asc: " + numTimesAscended + " " + lbracket + TextTransforms.apply("Working", [TextTransforms.Color.ChartsGray]) + rbracket + " " + nxtmutlp_div_by_currentmultp.toFixed(5) + " < " + calculated_asc_threshold.toFixed(4) + " (" + TextTransforms.apply("nxt_mltp: ", [TextTransforms.Color.ChartsGray]) + ns.formatNumber(next_Mult, "0.000a") + ")";
					if((next_Mult / current_Mult) >= CalculateAscendTreshold(current_Mult)){
						// Give message to ascend.
						output = "times_asc: " + numTimesAscended + " " + lbracket + TextTransforms.apply("✨Ascending✨", [TextTransforms.Color.ChartsGreen]) + rbracket + " " + nxtmutlp_div_by_currentmultp.toFixed(5) + " >= " + calculated_asc_threshold.toFixed(4) + " (" + TextTransforms.apply("nxt_mltp: ", [TextTransforms.Color.ChartsGray]) + ns.formatNumber(next_Mult, "0.000a") + ")";
						doAsc = true;
					}


					ns.print(member_name + ", " + output + " " + prepping + " \n");

					/*
                        ASCEND
                        ------
                        Doing Ascend(_mem) here, because there is a glitch that prevents
                        the output string from displaying when Ascend(_mem)
                        is lumped into the 'else if (multchange >= 2.0){ ... }' conditional area.
                    */
					if(doAsc){
						await ns.sleep(50);
						Ascend(mem); // ascend the member
						membersAscended.push(mem); // let this grow.
					}
				}
			} catch {
				// ignore.
			}
		}

		// RESET ENVIRONMNENT
		memberDataObj = {};
		memberStats.length = 0;

		ns.print(" \n");
		await ns.sleep(delay);
	}

	// Credit: Mysteyes. https://discord.com/channels/415207508303544321/415207923506216971/940379724214075442
	function CalculateAscendTreshold(mult){
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

	function NumberOfTimesAscended(membersAscended, name){
		let timesAscended = 0;
		for(let i = 0; i < membersAscended.length; i++){
			if(membersAscended[i] == name){
				timesAscended += 1;
			}
		}
		return timesAscended;
	}

	// Recruit a new prospect to a full gang member.
	async function RecruitProspect(){
		const currentMembers = ns.gang.getMemberNames();
		const availableNames = MemberNames.filter(x => !currentMembers.includes(x));
		ns.gang.recruitMember(availableNames[0]);
		ns.gang.setMemberTask(availableNames[0], "Train Hacking"); // Set to train initially.
		await ns.sleep(50);
	}

	// Ascend this current gang member
	function Ascend(name){
		return ns.gang.ascendMember(name); // Ascend the specified Gang Member.
	}

	function Prepare(name){
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

		let maxPrepCount = 0;
		if(buyingWeapons) maxPrepCount += Weapons.length;
		if(buyingArmor) maxPrepCount += buyingArmor.length;
		if(buyingArmor) maxPrepCount += Vehicles.length;
		if(buyingAugmentations && !isHacking) maxPrepCount += CrimeAugs.length;
		if(buyingAugmentations && isHacking) maxPrepCount += HackAugs.length;
		if(buyingRootkits && isHacking) maxPrepCount += Rootkits.length;

		const memberInformation = ns.gang.getMemberInformation(name);
		if(memberInformation.augmentations.length + memberInformation.upgrades.length >= maxPrepCount) memberPrepped.push(name);
	}

	// Attempt to assign Gang Member specified tasks
	function GiveAssignments(member, skillLevel){
		const memberInfo = ns.gang.getMemberInformation(member);

		const wantedLevel = memberInfo.wantedLevelGain;
		const earnedRespect = memberInfo.earnedRespect;

		// GET STATS
		memberStats.push(member + "|" + wantedLevel);
		memberStats.push(member + "|" + earnedRespect);


		let task = topRespect; // Generate Respect by default
		if(earnedRespect > RESPECT_BEFORE_MONEY) task = topEarner; // Make Money

		// Skill Training
		if(skillLevel < 400 && earnedRespect < 500){
			ns.gang.setMemberTask(member, trainStat);
			return memberStats.push(member + "|" + trainStat);
		}

		// Cops are comin' for us boss, lets do some good ye?
		if(wantedLevel >= 100) task = topVirtuous; // Vigilante Justice

		// Assign task and we're gucci
		ns.gang.setMemberTask(member, task);
		return memberStats.push(member + "|" + task);
	}
}