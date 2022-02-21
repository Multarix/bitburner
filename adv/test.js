/** @param {NS} ns **/
export async function main(ns) {
	const time = parseInt(ns.args[0]);
	if(time === NaN) ns.print("Argument passed was not a number");
	ns.print(timeConvert(time));
}
