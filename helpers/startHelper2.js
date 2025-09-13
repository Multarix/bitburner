/** @param {NS} ns */
export async function main(ns){
	try {

		const sleeveNumber = ns.sleeve.getNumSleeves();
		for(let i = 0; i < sleeveNumber; i++){
			ns.sleeve.setToCommitCrime(i, "Shoplift");
		}

	} catch (e){
		return;
	}
}