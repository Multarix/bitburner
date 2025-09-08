/** @param {NS} ns */
export async function main(ns){
	const hasMoney = ns.args[0];
	if(hasMoney){
		try {
			ns.singularity.goToLocation("Alpha Enterprises");
			ns.singularity.purchaseTor();
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