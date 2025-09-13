/**
 * @param {NS} ns
 * @param {string} destination
 */
function travelToCity(ns, destination){
	const player = ns.getPlayer();
	const currentCity = player.city;
	const playerMoney = player.money;

	if(currentCity === destination)	return true;
	if(playerMoney > 200000) return ns.singularity.travelToCity(destination);
}

/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	/** @type {import("NetscriptDefinitions").Task} task */
	const task = ns.args[0];
	const city = ns.args[0];

	switch(task.type){
		case "CLASS": {
			const classType = task.classType;
			const location = task.location;
			travelToCity(ns, city);
			ns.singularity.universityCourse(location, classType, true);
			break;
		}
		case "COMPANY": {
			const companyName = task.companyName;
			travelToCity(ns, city);
			ns.singularity.workForCompany(companyName, true);
			break;
		}
		case "CREATE_PROGRAM": {
			const programName = task.programName;
			ns.singularity.createProgram(programName, true);
			break;
		}
		case "CRIME": {
			const crimeType = task.crimeType;
			ns.singularity.goToLocation("The Slums");
			ns.singularity.commitCrime(crimeType, true);
			break;
		}
		case "FACTION": {
			const factionName = task.factionName;
			const factionWork = task.factionWorkType;
			ns.singularity.workForFaction(factionName, factionWork, true);
			break;
		}
		default: {
			// This is grafting, hopefully this is all not needed
		}
	}
}
