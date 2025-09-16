import { Color } from "helpers/Functions";


/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	ns.print(Color.set("Starting Script!", Color.preset.lightGreen));

	try {
		while(!ns.hasTorRouter()){
			if(ns.getPlayer().money > 200000){
				const bought = ns.singularity.purchaseTor();
				if(bought) ns.toast("Purchased TOR Router", "info", 10000);
			}

			await ns.sleep(10000);
		}

		ns.clearPort(4); // Report Back Port

		let hasAllPrograms = false;
		let ramFine = false;
		while((!hasAllPrograms || !ramFine)){
			await ns.sleep(1000);
			try {
				if(!hasAllPrograms){
					const pid = ns.run("/helpers/programBuyer.js", { threads: 1, preventDuplicates: true });
					if(!pid){
						ns.print(Color.set("Failed to run programBuyer, not enough free RAM!", Color.preset.red));
						continue;
					}

					await ns.nextPortWrite(4); // We'll know the programBuyer has pre much finished at this point
					await ns.sleep(100); // lil extra to make sure the ram got freed up
					hasAllPrograms = ns.readPort(4);
				}


				if(!ramFine){
					const pid = ns.run("/helpers/ramBuyer.js", { threads: 1, preventDuplicates: true });
					if(!pid){
						ns.print(Color.set("Failed to run ramBuyer, not enough free RAM!", Color.preset.red));
						continue;
					}

					await ns.nextPortWrite(4); // We'll know the programBuyer has pre much finished at this point
					await ns.sleep(100); // lil extra to make sure the ram got freed up

					ramFine = ns.readPort(4);
				}

			} catch (e){
				ns.print(e);
				continue;
			}
		}

	} catch (e){
		ns.print(Color.set("Error:", Color.preset.red));
		ns.print(e.message);
		ns.ui.openTail();
		ns.exit();
	}

	ns.print(Color.set("Finished Auto-Buying!", Color.preset.red));
}