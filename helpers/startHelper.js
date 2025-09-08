/** @param {NS} ns */
export async function main(ns){
	const hasMoney = ns.args[0];
	if(hasMoney){
		try {
			ns.singularity.goToLocation("Alpha Enterprises");
			const purchased = ns.singularity.purchaseTor();
			if(purchased) ns.toast("Purchased TOR Router", "info", 10000);
			ns.singularity.goToLocation("The Slums");
			ns.singularity.commitCrime("Shoplift");
			ns.singularity.setFocus(true);
		} catch (e){
			return;
		}
	} else {
		try {
			ns.singularity.goToLocation("The Slums");
			ns.singularity.commitCrime("Shoplift");
			ns.singularity.setFocus(true);
		} catch (e){
			return;
		}
	}
}