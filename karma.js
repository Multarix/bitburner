/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.ui.openTail();
	ns.ui.resizeTail(170, 58);
	ns.ui.setTailTitle("Karma");

	let hasAlerted = false;
	while(true){
		const karma = ns.getPlayer().karma.toFixed(2);
		ns.print(`Karma: ${karma}`);
		if(!hasAlerted && ns.getPlayer().karma <= -54000){
			ns.alert("Your karma has decreased enough to form a gang!");
			hasAlerted = true;

			ns.run("/helpers/joinFaction.js", { threads: 1, preventDuplicates: true }); // Because of singularity
			await ns.sleep(5000);

			const formedGang = ns.gang.createGang("Slum Snakes");
			if(formedGang){
				ns.run("/managers/gangManager.js", { threads: 1, preventDuplicates: true });
				ns.exit();
			}
		}
		await ns.sleep(100);
	}
}