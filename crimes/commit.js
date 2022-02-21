/** @param {NS} ns **/
export async function main(ns) {
	while (true){
		const crimeTime = ns.commitCrime("rob store");
		await ns.sleep(crimeTime + 2000);
	}
}
