/**
 * @param num {number} A number to be converted into abbreviated form
**/
export function numberConvert(num) {
	num = parseInt(num);
	if (num === NaN) return NaN;
	if (!num) num = 0;
	num = parseInt(num);
	let numString = '';

	if (num >= 1000000000000000) { // Higher than 1 quadrillion
		const convertedNum = (num / 1000000000000000).toFixed(2).toString().replace(/\.00$/, "");
		numString = (convertedNum >= 1000) ? `${convertedNum / 1000}Q` : `${convertedNum}q`; // Handle cases of using stupid looking "1000Q"
		return numString;
	}

	if (num >= 1000000000000) { // Higher than 1 trillion
		const convertedNum = (num / 1000000000000).toFixed(2).toString().replace(/\.00$/, "");
		numString = (convertedNum >= 1000) ? `${convertedNum / 1000}q` : `${convertedNum}t`; // Handle cases of using stupid looking "1000T"
		return numString;
	}

	if (num >= 1000000000) { // Higher than 1 billion
		const convertedNum = (num / 1000000000).toFixed(2).toString().replace(/\.00$/, "");
		numString = (convertedNum >= 1000) ? `${convertedNum / 1000}t` : `${convertedNum}b`; // Handle cases of using stupid looking "1000B"
		return numString;
	}

	if (num >= 1000000) { // Higher than 1 million
		const convertedNum = (num / 1000000).toFixed(2).toString().replace(/\.00$/, "");
		numString = (convertedNum >= 1000) ? `${convertedNum / 1000}b` : `${convertedNum}m`; // Handle cases of using stupid looking "1000M"
		return numString;
	}

	if (num >= 1000) { // Higher than 1 thousand
		const convertedNum = (num / 1000).toFixed(2).toString().replace(/\.00$/, "");
		numString = (convertedNum >= 1000) ? `${convertedNum / 1000}m` : `${convertedNum}k`; // Handle cases of using stupid looking "1000k"
		return numString;
	}

	return `${num}`;
}
