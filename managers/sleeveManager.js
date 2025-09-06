import { Color } from "helpers/Functions";

const IGNORE_SYNC_SHOCK = true; // Toggle this if sleeves should ignore trying to recover or sync

const TRAINING_THRESHOLD = 40;
const MIN_SYNC = 95;
const MAX_SYNC = 100;
const MAX_SHOCK = 5;
const MIN_SHOCK = 0;
const TRAVEL_COST = 200000;
const BUY_AUGMENTS = true;


/**
 * @typedef CrimeData
 * @property {boolean} isCrime
 * @property {number} chance
 */


/**
 * @typedef {Object} SleeveData
 * @property {boolean} shouldSync
 * @property {boolean} shouldRecover
 * @property {string} activity
 * @property {CrimeData} crime
 **/

/**
 * @typedef SleeveInfo
 * @property {number} id
 * @property {number} sync
 * @property {number} shock
 * @property {number} str
 * @property {number} def
 * @property {number} dex
 * @property {number} agi
 * @property {number} hack
 * @property {string} activity
 * @property {CrimeData} crime
 */

/**
 *
 * @param {SleeveInfo} sleeveInfo
 * @param {number} numSleeves
 * @returns
 */
function sleeveLog(sleeveInfo, numSleeves){
	const preceedingZeros = numSleeves.toString().length;
	const sleeveIDString = sleeveInfo.id.toString().padStart(preceedingZeros + 1, "0");
	const sleeveID = Color.set(`Sleeve-${sleeveIDString} -`, Color.preset.white);
	const syncLevel = `🔄 ${Color.set(sleeveInfo.sync.toFixed(3).padStart(7, " ") + "%", Color.preset.lightBlue)}`;
	const shckLevel = `⚠️ ${Color.set(sleeveInfo.shock.toFixed(3).padStart(6, " ") + "%", Color.preset.lightYellow)}`;

	const hck = `💻 ${Color.set(sleeveInfo.hack.toString().padStart(4, "·"), Color.preset.lightPurple)}`;
	const str = `💪 ${Color.set(sleeveInfo.str.toString().padStart(4, "·"), Color.preset.lightPurple)}`;
	const def = `🛡️ ${Color.set(sleeveInfo.def.toString().padStart(4, "·"), Color.preset.lightPurple)}`;
	const dex = `🖐️ ${Color.set(sleeveInfo.dex.toString().padStart(4, "·"), Color.preset.lightPurple)}`;
	const agi = `🦶 ${Color.set(sleeveInfo.agi.toString().padStart(4, "·"), Color.preset.lightPurple)}`;


	const crimeChance = (sleeveInfo.crime.chance * 100).toFixed(2);
	let crimeChanceColor = Color.preset.red;
	if(sleeveInfo.crime.chance > 0.25) crimeChanceColor = Color.preset.orange;
	if(sleeveInfo.crime.chance > 0.50) crimeChanceColor = Color.preset.yellow;
	if(sleeveInfo.crime.chance > 0.75) crimeChanceColor = Color.preset.green;
	if(sleeveInfo.crime.chance === 1) crimeChanceColor = Color.preset.cyan;


	const g = Color.set("|", Color.preset.white);
	const activity = (sleeveInfo.crime.isCrime) ? `${Color.set(sleeveInfo.activity, Color.preset.lightGreen)} ${Color.set("[", Color.preset.white)}${Color.set(crimeChance + "%", crimeChanceColor)}${Color.set("]", Color.preset.white)}` : Color.set(sleeveInfo.activity, Color.preset.lightGreen);

	// Example output:
	// 🤖 Sleeve-01 - 🔄 100.000% | ⚠️ 18.725% | 💻 ···3 | 💪 ··39 | 🛡️ ··39 | 🙌 ··41 | 🏃 ··41 | Activity: Homicide [20.80%]
	return ` 🤖 ${sleeveID} ${syncLevel} ${g} ${shckLevel} ${g} ${hck} ${g} ${str} ${g} ${def} ${g} ${dex} ${g} ${agi} ${Color.set("| Task:", Color.preset.white)} ${activity}`;
}


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	/** @type {Object<string, SleeveData>} */
	const sleeves = {};

	const CrimeType = ns.enums.CrimeType;
	const CityName = ns.enums.CityName;
	const LocationNames = ns.enums.LocationName;
	const GymType = ns.enums.GymType;
	const UniType = ns.enums.UniversityClassType;

	while(true){
		const numSleeves = ns.sleeve.getNumSleeves();
		for(let i = 0; i < numSleeves; i++){
			if(!sleeves[i.toString()]){
				const sleeve = ns.sleeve.getSleeve(i);
				sleeves[i.toString()] = {
					shouldRecover: sleeve.shock > MAX_SHOCK,
					shouldSync: sleeve.sync < MIN_SYNC,
					activity: "",
					crime: {
						isCrime: false,
						chance: 0
					}
				};
			}
		}


		// Buy Augments
		if(BUY_AUGMENTS){
			for(const [ID, _sleeveData] of Object.entries(sleeves)){
				const sleeveID = parseInt(ID);
				const sleeve = ns.sleeve.getSleeve(sleeveID);
				if(sleeve.shock > 0) continue;

				const availableAugments = ns.sleeve.getSleevePurchasableAugs(sleeveID);
				for(const augment of availableAugments){
					if(ns.getPlayer().money > augment.cost) ns.sleeve.purchaseSleeveAug(sleeveID, augment.name);
				}
			}
		}


		// Set Activity
		for(const [ID, sleeveData] of Object.entries(sleeves)){
			const sleeveID = parseInt(ID);
			const sleeve = ns.sleeve.getSleeve(sleeveID);
			const currentTask = ns.sleeve.getTask(sleeveID);
			const skills = sleeve.skills;

			// Recover
			if((!sleeveData.shouldRecover && sleeve.shock >= MAX_SHOCK)) sleeveData.shouldRecover = true;
			if(sleeve.shock <= MIN_SHOCK) sleeveData.shouldRecover = false;

			// Syncing
			if(!sleeveData.shouldSync && sleeve.sync <= MIN_SYNC) sleeveData.shouldSync = true;
			if(sleeve.sync >= MAX_SYNC) sleeveData.shouldSync = false;

			if(!IGNORE_SYNC_SHOCK){
				if(sleeveData.shouldSync){ // Sync before we do anything with it
					if(currentTask?.type !== "SYNCHRO") ns.sleeve.setToSynchronize(sleeveID);
					sleeveData.activity = "Synchronizing";
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(sleeveData.shouldRecover){ // Recover before we do anything with it
					if(currentTask?.type !== "RECOVERY") ns.sleeve.setToShockRecovery(sleeveID);
					sleeveData.activity = "Shock Recovery";
					sleeveData.crime.isCrime = false;
					continue;
				}
			}

			// If any of our skills are below the training threshold...
			if(skills.strength < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.strength) ||
			skills.defense < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.defense) ||
			skills.dexterity < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.dexterity) ||
			skills.agility < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.agility)){
				// Move to Sector12, best gym is there
				if(sleeve.city !== CityName.Sector12){
					if(ns.getPlayer().money > TRAVEL_COST){
						ns.sleeve.travel(sleeveID, CityName.Sector12);
					} else {
						ns.sleeve.setToIdle(sleeveID);
						sleeveData.activity = "Traveling...";
						sleeveData.crime.isCrime = false;
						continue;
					}
				}

				// Send Sleeve to the gym if under the threshold for any given skill
				if(skills.strength < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.strength)){
					if(currentTask?.classType !== GymType.strength || currentTask?.location !== LocationNames.Sector12PowerhouseGym){
						ns.sleeve.setToGymWorkout(sleeveID, LocationNames.Sector12PowerhouseGym, GymType.strength);
					}
					sleeveData.activity = `Training STR (${Math.round(TRAINING_THRESHOLD * sleeve.mults.strength)})`;
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(skills.defense < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.defense)){
					if(currentTask?.classType !== GymType.defense || currentTask?.location !== LocationNames.Sector12PowerhouseGym){
						ns.sleeve.setToGymWorkout(sleeveID, LocationNames.Sector12PowerhouseGym, GymType.defense);
					}
					sleeveData.activity = `Training DEF (${Math.round(TRAINING_THRESHOLD * sleeve.mults.defense)})`;
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(skills.dexterity < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.dexterity)){
					if(currentTask?.classType !== GymType.dexterity || currentTask?.location !== LocationNames.Sector12PowerhouseGym){
						ns.sleeve.setToGymWorkout(sleeveID, LocationNames.Sector12PowerhouseGym, GymType.dexterity);
					}
					sleeveData.activity = `Training DEX (${Math.round(TRAINING_THRESHOLD * sleeve.mults.dexterity)})`;
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(skills.agility < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.agility)){
					if(currentTask?.classType !== GymType.agility || currentTask?.location !== LocationNames.Sector12PowerhouseGym){
						ns.sleeve.setToGymWorkout(sleeveID, LocationNames.Sector12PowerhouseGym, GymType.agility);
					}
					sleeveData.activity = `Training AGI (${Math.round(TRAINING_THRESHOLD * sleeve.mults.agility)})`;
					sleeveData.crime.isCrime = false;
					continue;
				}
			}

			if(skills.hacking < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.hacking)){
				if(sleeve.city !== CityName.Aevum){
					if(ns.getPlayer().money > TRAVEL_COST){
						ns.sleeve.travel(sleeveID, CityName.Aevum);
					} else {
						ns.sleeve.setToIdle(sleeveID);
						sleeveData.activity = "Traveling...";
						sleeveData.crime.isCrime = false;
						continue;
					}
				}

				if(currentTask?.classType !== UniType.algorithms || currentTask?.location !== LocationNames.AevumSummitUniversity){
					ns.sleeve.setToUniversityCourse(sleeveID, LocationNames.AevumSummitUniversity, UniType.algorithms);
				}
				sleeveData.activity = `Training Hack (${Math.round(TRAINING_THRESHOLD * sleeve.mults.hacking)})`;
				sleeveData.crime.isCrime = false;
				continue;
			}

			// Great, now just go commit crimes until we can make a gang.

			let crimeToCommit = CrimeType.shoplift;
			if(ns.formulas.work.crimeSuccessChance(sleeve, CrimeType.mug) > 0.9) crimeToCommit = CrimeType.mug;
			if(ns.formulas.work.crimeSuccessChance(sleeve, CrimeType.homicide) > 0.15) crimeToCommit = CrimeType.homicide;
			if(ns.gang.inGang()){
				if(ns.formulas.work.crimeSuccessChance(sleeve, CrimeType.grandTheftAuto) > 0.75) crimeToCommit = CrimeType.grandTheftAuto;
				if(ns.formulas.work.crimeSuccessChance(sleeve, CrimeType.assassination) > 0.80) crimeToCommit = CrimeType.assassination;
				if(ns.formulas.work.crimeSuccessChance(sleeve, CrimeType.heist) > 0.85) crimeToCommit = CrimeType.heist;
			}


			sleeveData.crime.isCrime = true;
			sleeveData.crime.chance = ns.formulas.work.crimeSuccessChance(sleeve, crimeToCommit);
			if(currentTask?.crimeType !== crimeToCommit) ns.sleeve.setToCommitCrime(sleeveID, crimeToCommit);
			sleeveData.activity = crimeToCommit;
		}

		// Logging
		const sleeveInfo = [];
		const totalSleeves = Object.keys(sleeves).length;
		for(const [ID, sleeveData] of Object.entries(sleeves)){
			const sleeveID = parseInt(ID);
			const sleeve = ns.sleeve.getSleeve(sleeveID);

			const data = {
				id: sleeveID + 1,
				sync: sleeve.sync,
				shock: sleeve.shock,
				str: sleeve.skills.strength,
				def: sleeve.skills.defense,
				dex: sleeve.skills.dexterity,
				agi: sleeve.skills.agility,
				hack: sleeve.skills.hacking,
				activity: sleeveData.activity,
				crime: sleeveData.crime
			};

			const logLine = sleeveLog(data, totalSleeves);
			sleeveInfo.push(logLine);
		}

		ns.clearLog();
		ns.print(sleeveInfo.join("\n"));
		ns.ui.setTailTitle(`\u200b Managing ${totalSleeves} sleeve${(totalSleeves > 1) ? "s" : ""}`);

		ns.ui.resizeTail(1135, 28 + (22 * totalSleeves));
		ns.ui.setTailFontSize(14);

		await ns.sleep(100);
	}
}