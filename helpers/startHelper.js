/** @param {NS} ns */
export async function main(ns){
	try {
		const hasMoney = ns.args[0];
		if(hasMoney){
			ns.singularity.goToLocation("Alpha Enterprises");
			const purchased = ns.singularity.purchaseTor();
			if(purchased) ns.toast("Purchased TOR Router", "info", 10000);
			ns.singularity.goToLocation("The Slums");
			ns.singularity.commitCrime("Shoplift");
			ns.singularity.setFocus(true);
		} else {

			ns.singularity.goToLocation("The Slums");
			ns.singularity.commitCrime("Shoplift");
			ns.singularity.setFocus(true);

		}

		const sleeveNumber = ns.sleeve.getNumSleeves();
		for(let i = 0; i < sleeveNumber; i++){
			ns.sleeve.setToCommitCrime(i, "Shoplift");
		}

	} catch (e){
		return;
	}
}