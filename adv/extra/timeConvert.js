/**
 * @param ms {number} A number to be converted from ms to Hours/ Minutes/ Seconds
 **/
export function timeConvert(ms) {
	ms = parseInt(ms);
	if(ms === NaN) return NaN;
	if (!ms || 1000 > ms) ms = 1000;
	let secondsRAW = ms / 1000;
	let seconds = secondsRAW % 60;

	let minutesRAW = secondsRAW / 60;
	let minutes = minutesRAW % 60;

	let hoursRAW = minutesRAW / 60;
	let hours = hoursRAW % 24;

	if (hours < 1) hours = 0;
	if (minutes < 1) minutes = 0;

	let timeArray = [];
	if (Math.floor(hours) >= 1) timeArray.push(`${Math.floor(hours)}h`);
	if (Math.floor(hours) >= 1 || Math.floor(minutes) >= 1) timeArray.push(`${Math.floor(minutes)}m`);
	if (Math.floor(hours) >= 1 || Math.floor(minutes) >= 1 || Math.floor(seconds) >= 1) timeArray.push(`${Math.floor(seconds)}s`);

	const timeString = (timeArray.length > 1) ? timeArray.join(" ") : timeArray[0];
	return timeString;
}
