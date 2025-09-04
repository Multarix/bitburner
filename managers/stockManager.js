const inHand = 0.25; // % of funds to keep in hand. Default 0.25
const numCyclesToProject = 2; // Only buy stocks that are projected to increase for this amount of cycles. Recommended 2-5. Default 2
const expectedRetentionLossToSell = -0.40; // Percent change between initial forecast and current forcast. ie if current forecast is 40% worse than initial, sell. Default -0.40
const commission = 100000; // Current Buy/Sell Comission cost

const ShouldSellPort = 11;

/** @param {NS} ns */
function pChange(ns, sym, oldNum, newNum){
	const diff = newNum < oldNum ? -(oldNum - newNum) : newNum - oldNum;
	const pdiff = diff / oldNum;
	ns.print(` ${sym}:\t| ${oldNum.toFixed(5)} -> ${newNum.toFixed(5)}\t| ${(pdiff * 100).toFixed(3)}%`);
	return pdiff;
}

/** @param {NS} ns */
function getStocks(ns, stocks, myStocks){
	let corpus = ns.getServerMoneyAvailable("home");
	myStocks.length = 0;
	for(let i = 0; i < stocks.length; i++){
		const sym = stocks[i].sym;
		stocks[i].askPrice = ns.stock.getAskPrice(sym);
		stocks[i].bidPrice = ns.stock.getBidPrice(sym);
		stocks[i].shares = ns.stock.getPosition(sym)[0];
		stocks[i].buyPrice = ns.stock.getPosition(sym)[1];
		stocks[i].vol = ns.stock.getVolatility(sym);
		stocks[i].prob = 2 * (ns.stock.getForecast(sym) - 0.5);
		stocks[i].expRet = stocks[i].vol * stocks[i].prob / 2;
		if(stocks[i].shares > 0){
			stocks[i].initExpRet ||= stocks[i].expRet;
		} else {
			stocks[i].initExpRet = null;
		}

		// corpus += stocks[i].buyPrice * stocks[i].shares;
		corpus += stocks[i].bidPrice * stocks[i].shares;
		if(stocks[i].shares > 0) myStocks.push(stocks[i]);
	}
	stocks.sort(function(a, b){
		return b.expRet - a.expRet;
	});
	return corpus;
}

/** @param {NS} ns */
function buy(ns, stock, numShares){
	const max = ns.stock.getMaxShares(stock.sym);
	numShares = max < numShares ? max : numShares;

	const total = ns.stock.buyStock(stock.sym, numShares) * numShares;
	ns.print(`Bought ${stock.sym} for $${ns.formatNumber(total + commission)}`);
}

/** @param {NS} ns */
function sell(ns, stock, numShares){
	const profit = ns.stock.sellStock(stock.sym, numShares) * numShares;
	ns.print(`Sold ${stock.sym} for profit of $${ns.formatNumber(profit - commission)}`);
}

/** @param {NS} ns */
export async function main(ns){
	let sellOff = false;
	let unexpectedExit = false;
	ns.disableLog("ALL");
	ns.ui.openTail();

	const stocks = [...ns.stock.getSymbols().map(_sym => {
		return { sym: _sym };
	})];
	const myStocks = [];
	let corpus = 0;
	while(true){
		const updatePromise = ns.stock.nextUpdate(); // wait after calcs

		corpus = getStocks(ns, stocks, myStocks);
		if(sellOff && myStocks.length < 1){
			unexpectedExit = true;
			ns.tail();
			ns.print("All stocks have been sold off. Final totals:");
			ns.print(`Total Money: $${ns.formatNumber(corpus)}`);
			ns.alert(`All stocks have been sold off.\nFinal Totals $${ns.formatNumber(corpus)}`);
			ns.exit();
		}
		// Symbol, Initial Return, Current Return, The % change between
		// the Initial Return and the Current Return.
		ns.clearLog();
		ns.print("Currently Owned Stocks:");
		ns.print(" SYM\t| InitReturn -> CurReturn | % change");

		// Sell underperforming shares
		for(let i = 0; i < myStocks.length; i++){
			if(pChange(ns, myStocks[i].sym, myStocks[i].initExpRet, myStocks[i].expRet) <= expectedRetentionLossToSell){
				sell(ns, myStocks[i], myStocks[i].shares);
			}

			if(myStocks[i].expRet <= 0){
				sell(ns, myStocks[i], myStocks[i].shares);
			}

			corpus -= commission;
		}

		ns.print("----------------------------------------");

		ns.print(" SYM\t| $ invested\t| $ profit");
		for(let i = 0; i < myStocks.length; i++){
			ns.print(` ${myStocks[i].sym}:\t| ${ns.formatNumber(myStocks[i].shares * myStocks[i].buyPrice)}\t| ${ns.formatNumber((myStocks[i].shares * (myStocks[i].bidPrice - myStocks[i].buyPrice)) - (2 * commission))}`);
		}

		ns.print("________________________________________");

		// Buy shares with cash remaining in hand

		if(!sellOff){
			if(ns.peek(ShouldSellPort) === 1){
				sellOff = true;
				ns.tail();
				continue;
			} else {
				for(const stock of stocks){
					if(stock.shares > 0) continue;
					if(stock.expRet <= 0) continue;
					const cashToSpend = ns.getServerMoneyAvailable("home") - (inHand * corpus);
					const numShares = Math.floor((cashToSpend - commission) / stock.askPrice);
					if((numShares * stock.expRet * stock.askPrice * numCyclesToProject) > (commission * 2)){
						buy(ns, stock, numShares);
					}
					break;
				}
			}
		}
		if(sellOff){
			ns.print("Will stop buying and sell off stocks when profitable.");
		}
		ns.print(`Total Money: $${ns.formatNumber(corpus)}`);

		await updatePromise; // finish first wait, wait for any additional
		for(let ii = 1; ii < numCyclesToProject; ++ii){
			await ns.stock.nextUpdate();
		}
	}
}