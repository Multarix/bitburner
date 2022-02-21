/** @param {NS} ns **/
export async function main(ns) {
	const type = ns.args[0];
	const threads = ns.args[1]
	const target = ns.args[2];
	const ident = ns.args[3];
	const waitTime = ns.args[4];

	if (waitTime) await ns.sleep(waitTime);
	try {
		ns.run(`/scripts/optimal/${type}.js`, threads, target, ident);
	} catch (e) {
		ns.toast(e.message, "error", 15000);
	}

}
