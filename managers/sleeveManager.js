import { magenta, yellow, cyan, green, white } from "helpers/Functions";

const IGNORE_SYNC_SHOCK = false; // Toggle this if sleeves should ignore trying to recover or sync

const TRAINING_THRESHOLD = 35;
const MIN_SYNC = 95;
const MAX_SYNC = 100;
const MAX_SHOCK = 5;
const MIN_SHOCK = 0;
const TRAVEL_COST = 200000;
const BUY_AUGMENTS = true;

// Shock goes down even when focusing on other tasks, so we can focus
// on syncing rather than shock recovery in certain situations.
const SYNC_SHOCK_RATIO = 2;


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


/** @type {Object<string, SleeveData>} */
const sleeves = {}; // This is global so it technically persists through an restart but I ain't holdin' my breath on that theory


/**
 * @typedef SleeveInfo
 * @property {number} id
 * @property {number} sync
 * @property {number} shock
 * @property {number} str
 * @property {number} def
 * @property {number} dex
 * @property {number} agi
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
	const sleeveID = yellow(`Sleeve-${sleeveIDString}`);
	const syncLevel = magenta(sleeveInfo.sync.toFixed(3).padStart(7, " "));
	const shockLevel = magenta(sleeveInfo.shock.toFixed(3).padStart(6, " "));

	const str = cyan(sleeveInfo.str.toString().padStart(3, " "));
	const def = cyan(sleeveInfo.def.toString().padStart(3, " "));
	const dex = cyan(sleeveInfo.dex.toString().padStart(3, " "));
	const agi = cyan(sleeveInfo.agi.toString().padStart(3, " "));


	const crimeChance = (sleeveInfo.crime.chance * 100).toFixed(2);
	const activity = (sleeveInfo.crime.isCrime) ? `${green(sleeveInfo.activity)} [${cyan(crimeChance + "%")}]` : green(sleeveInfo.activity);

	// Sleeve #1  -  Sync: 98.245 | Shock: 0 | STR: 0001 | DEF: 0001 | DEX: 0001| AGI: 0001 | Activity: Synchronizing
	return ` ${sleeveID}  \u001b[37m-  Sync: ${syncLevel} \u001b[37m| Shock: ${shockLevel} \u001b[37m| STR: ${str} \u001b[37m| DEF: ${def} \u001b[37m| DEX: ${dex} \u001b[37m| AGI: ${agi} \u001b[37m| Activity: ${activity}`;
}


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	const CrimeType = ns.enums.CrimeType;
	const CityName = ns.enums.CityName;
	const LocationNames = ns.enums.LocationName;
	const GymType = ns.enums.GymType;

	/* ********************** */
	/*                        */
	/*       Additional       */
	/*        Settings        */
	/*                        */
	/* ********************** */


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
				if(sleeveData.shouldRecover){ // Recover before we do anything with it
					const amountToSync = (100 - sleeve.sync);
					if(amountToSync > sleeve.shock * SYNC_SHOCK_RATIO){
						// The amount to sync is {SyncShockRatio} the shock, thus by the time sync is at 100, shock should be at 0.
						// This is a minor optimisation to take advantage of the fact shock goes down even when not focusing it.
						if(currentTask?.type !== "SYNCHRO") ns.sleeve.setToSynchronize(sleeveID);
						sleeveData.activity = "Synchronizing";
						sleeveData.crime.isCrime = false;
						continue;
					}

					if(currentTask?.type !== "RECOVERY") ns.sleeve.setToShockRecovery(sleeveID);
					sleeveData.activity = "Shock Recovery";
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(sleeveData.shouldSync){ // Sync before we do anything with it
					if(currentTask?.type !== "SYNCHRO") ns.sleeve.setToSynchronize(sleeveID);
					sleeveData.activity = "Synchronizing";
					sleeveData.crime.isCrime = false;
					continue;
				}
			}

			// If any of our skills are below the training threshold...
			if(skills.strength < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.strength_exp * sleeve.mults.strength) ||
			skills.defense < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.defense_exp * sleeve.mults.defense) ||
			skills.dexterity < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.dexterity_exp * sleeve.mults.dexterity) ||
			skills.agility < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.agility_exp * sleeve.mults.agility)){
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
					sleeveData.activity = "Training STR";
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(skills.defense < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.defense)){
					if(currentTask?.classType !== GymType.defense || currentTask?.location !== LocationNames.Sector12PowerhouseGym){
						ns.sleeve.setToGymWorkout(sleeveID, LocationNames.Sector12PowerhouseGym, GymType.defense);
					}
					sleeveData.activity = "Training DEF";
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(skills.dexterity < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.dexterity)){
					if(currentTask?.classType !== GymType.dexterity || currentTask?.location !== LocationNames.Sector12PowerhouseGym){
						ns.sleeve.setToGymWorkout(sleeveID, LocationNames.Sector12PowerhouseGym, GymType.dexterity);
					}
					sleeveData.activity = "Training DEX";
					sleeveData.crime.isCrime = false;
					continue;
				}

				if(skills.agility < Math.ceil(TRAINING_THRESHOLD * sleeve.mults.agility)){
					if(currentTask?.classType !== GymType.agility || currentTask?.location !== LocationNames.Sector12PowerhouseGym){
						ns.sleeve.setToGymWorkout(sleeveID, LocationNames.Sector12PowerhouseGym, GymType.agility);
					}
					sleeveData.activity = "Training AGI";
					sleeveData.crime.isCrime = false;
					continue;
				}
			}

			// Great, now just go commit crimes until we can make a gang.

			let crimeToCommit = CrimeType.shoplift;
			if(ns.formulas.work.crimeSuccessChance(sleeve, CrimeType.mug) > 0.9) crimeToCommit = CrimeType.mug;
			if(ns.formulas.work.crimeSuccessChance(sleeve, CrimeType.homicide) > 0.25) crimeToCommit = CrimeType.homicide;
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
				activity: sleeveData.activity,
				crime: sleeveData.crime
			};

			const logLine = sleeveLog(data, totalSleeves);
			sleeveInfo.push(logLine);
		}

		const sleeveExtraInfo = [
			`${white(" Total Sleeves:")} ${cyan(totalSleeves)}`,
			"\n"
		];
		ns.clearLog();
		ns.print(sleeveExtraInfo.join("\n"));
		ns.print(sleeveInfo.join("\n"));
		ns.ui.setTailTitle(`\u200b Managing ${totalSleeves} sleeve${(totalSleeves > 1) ? "s" : ""}`);

		ns.ui.resizeTail(1285, 87 + (25 * totalSleeves));

		await ns.sleep(100);
	}
}