/** @param {NS} ns */
export async function main(ns){
	try {
		ns.singularity.purchaseTor();
		ns.singularity.commitCrime("Shoplift");
		ns.singularity.setFocus(true);
	} catch (e){
		return;
	}
}