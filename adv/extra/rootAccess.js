/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	if (!ns.hasRootAccess(target)) {
		let ports = 0;
		let nuked = false;
		if (ns.fileExists("brutessh.exe", "home")) {
			ports++;
			ns.brutessh(target);
		}
		if (ns.fileExists("ftpcrack.exe", "home")) {
			ports++
			ns.ftpcrack(target);
		}
		if (ns.fileExists("httpworm.exe", "home")) {
			ports++
			ns.httpworm(target);
		}
		if (ns.fileExists("relaysmtp.exe", "home")) {
			ports++
			ns.relaysmtp(target);
		}
		if (ns.fileExists("sqlinject.exe", "home")) {
			ports++
			ns.sqlinject(target);
		}
		if (ns.fileExists("nuke.exe", "home")) {
			if (ports >= ns.getServerNumPortsRequired(target)) {
				ns.nuke(target);
				nuked = true;
			}
		}
		// if(nuked) if(ns.fileExists()) ns.installBackdoor()
		ns.toast(`Opened ${ports} ports ${(nuked) ? "and successfully gained root access " : ""}on ${target}`, "success", 10000);
	}
}
