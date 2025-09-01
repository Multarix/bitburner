import { numberConvert } from "/helpers/Functions.js";
/** @param {NS} ns **/
export async function main(ns){
	const server = ns.args[0];

	while(true){
		const money = await ns.hack(server);
		if(money > 0) ns.toast(`Hacked ${server} for $${numberConvert(money)}`, "success", "8000");
	}
}