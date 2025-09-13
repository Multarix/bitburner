import { Color } from "helpers/Functions";


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	ns.print(Color.set("Starting Script!", Color.preset.lightGreen));



	try {
		while(!ns.hasTorRouter()){
			if(ns.getPlayer().money > 200000){
				ns.singularity.purchaseTor();
			}

			await ns.sleep(10000);
		}

		ns.clearPort(4); // Report Back Port

		let hasAllPrograms = false;
		let ramFine = false;
		while((!hasAllPrograms || !ramFine)){
			try {
				const city = ns.getPlayer().city;
				const currentTask = ns.singularity.getCurrentWork();

				if(!hasAllPrograms){
					ns.run("/helpers/programBuyer.js", { threads: 1, preventDuplicates: true }, city, currentTask);

					await ns.nextPortWrite(4); // We'll know the programBuyer has pre much finished at this point
					hasAllPrograms = ns.readPort(4);
					await ns.sleep(100); // lil extra to make sure the ram got freed up
				}


				if(!ramFine){
					ns.run("/helpers/ramBuyer.js", { threads: 1, preventDuplicates: true }, currentTask);

					await ns.nextPortWrite(4); // We'll know the programBuyer has pre much finished at this point
					ramFine = ns.readPort(4);
					await ns.sleep(100); // lil extra to make sure the ram got freed up
				}

			} catch {
				continue;
			}
			await ns.sleep(10000);
		}

	} catch (e){
		ns.print(Color.set("Error:", Color.preset.red));
		ns.print(e.message);
		ns.ui.openTail();
		ns.exit();
	}

	ns.print(Color.set("Finished Auto-Buying!", Color.preset.red));
}