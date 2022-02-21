import { numberConvert } from "/adv/extra/numberConvert.js";
/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	const money = await ns.hack(target);
	if(money > 0) ns.toast(`Hacked ${target} for $${numberConvert(money)}`, "success", 8000);
	if(money === 0) ns.toast(`Failed to hack ${target}`, "warning", 8000);
}
