/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	// Goal 1, CyberSec, buy all their augments: Order
	const cyberSecAugments = [
		"Cranial Signal Processors - Gen I",
		"Cranial Signal Processors - Gen II",
		"BitWire",
		"Synaptic Enhancement Implant",
		"Neurotrainer I"
	];
	ns.writePort(6, 1);
	ns.singularity.installAugmentations("start.js");

	// Goal 2, NiteSec, buy all their augments: Order
	const niteSecAugments = [
		"Cranial Signal Processors - Gen I",
		"Cranial Signal Processors - Gen II",
		"Cranial Signal Processors - Gen III",
		"DataJack",
		"Embedded Netburner Module",
		"Neural-Retention Enhancement",
		"CRTX42-AA Gene Modification",
		"Artificial Synaptic Potentiation",
		"Neurotrainer II",
		"BitWire"
	];
	ns.writePort(6, 2);
	ns.singularity.installAugmentations("start.js");


	// Goal 3, The Black Hand, buy all their augments: Order
	const blackHandAugments = [];
	ns.writePort(6, 3);
	ns.singularity.installAugmentations("start.js");


	// Goal 4, Bitrunners, buy all their augments: Order
	const bitRunnersAugments = [];
	ns.writePort(6, 4);
	ns.singularity.installAugmentations("start.js");


	// Goal 5, Daedalus, join, get rep to 450k, install any augment
	// Goal 6, Daedalus, buy all their augments: Order
	const daedalusAugments = [];
	ns.writePort(6, 5);
	ns.singularity.installAugmentations("start.js");


	// Goal 7, Destroy Bitnode
	ns.writePort(6, 0);
	ns.singularity.destroyW0r1dD43m0n(12, "start.js");
}