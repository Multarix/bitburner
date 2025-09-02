/** @param {NS} ns **/
export async function main(ns){
	ns.disableLog("ALL");
	ns.clearLog();

	const portNumber = parseInt(ns.args[0]);
	if(!portNumber || typeof portNumber !== "number") throw "Port number is not a number";
	if(!ns.args[1]) throw "Data for port does not exist";

	ns.clearPort(portNumber);
	ns.writePort(portNumber, ns.args[1]);
}