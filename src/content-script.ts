// @ts-ignore
import mainWorld from "./content-main-world?script&module";
const PREFIX = "MBAP";
const LOG_PREFIX = "My Binance Average Price:";

const orderHistorySelector = '[data-testid="OrderHistory"]';

const script = document.createElement("script");
script.src = chrome.runtime.getURL(mainWorld);
script.type = "module";
script.addEventListener("load", async () => {
  console.log("script loaded");

  let tab = document.querySelector("#tab-1");

  while (!tab) {
    await sleep(100);
    console.log("waiting for tab");
    tab = document.querySelector("#tab-1");
  }

  //  1. click on My Trades
  if (tab instanceof HTMLElement) {
    tab.click();
  }
  await sleep(500);

  if (noTrades()) {
    console.log("no trades");
  } else {
    // Get trades from My Trades tab
    myTrades()
  }

  // 2. Order History

  orderHistory('1 Month')
});

script.addEventListener("error", (err) => {
  console.log("script error");
  console.error(err);
});
console.log("starting script");
document.head.append(script);

// filter
// -url:https://bin.bnbstatic.com/static-br/static/chunks/bnc~pl~1.bc97a5ce.js -url:https://o529943.ingest.sentry.io/api/5684836/envelope/?sentry_key=98cacb9d46384ac4abd400761cf7002e&sentry_version=7 -url:https://bin.bnbstatic.com/static/fiat-activation-ui/fiat-activation-widget.9d3e3cf.js -url:https://www.binance.com/en/trade/ANC_USDT?theme=dark&type=isolated -url:https://api.saasexch.com/bapi/fe/usd/sa.gif?project=binance -url:https://bin.bnbstatic.com/static-br/static/chunks/common2.fd3a05d1.js

const createCheckbox = (i: number) => {
  var newCheckBox = document.createElement("input");
  newCheckBox.onchange = () => {
    console.log("checkbox changed", i);
    recalculateAveragePrice();
  };
  newCheckBox.type = "checkbox";
  newCheckBox.className = PREFIX;
  newCheckBox.id = "i" + i; // need unique Ids!
  // newCheckBox.value = check_value[count] + '<br/>';
  return newCheckBox;
};

const recalculateAveragePrice = () => {
  let totalCost = 0;
  let totalAmount = 0;
  // get all checked checkboxes
  document.querySelectorAll(`input.${PREFIX}[type=checkbox]:checked`).forEach((checkbox) => {
    console.log("checked", checkbox);
    const price = checkbox.nextSibling?.textContent;
    const amount = checkbox.nextSibling?.nextSibling?.textContent;

    if (!price || !amount) {
      console.error(`${LOG_PREFIX} no price or amount`);
      return;
    }
    totalCost += parseFloat(price) * parseFloat(amount);
    totalAmount += parseFloat(amount);
    console.log("price", price);
    console.log("amount", amount);
    console.log("totalCost", totalCost);
    console.log("totalAmount", totalAmount);

    let averagePrice = totalCost / totalAmount;
    // round to 5 decimals
    averagePrice = Math.round((totalCost / totalAmount) * 100000) / 100000;
    console.log(`${LOG_PREFIX} average price: ${averagePrice}`);
    const tabParent = document.querySelector("#tab-1")?.parentElement;
    // remove old span
    document.getElementById("averagePrice")?.remove();
    const div = createDiv(averagePrice);
    tabParent?.append(div);
  });
};

const createDiv = (averagePrice: number) => {
  const div = document.createElement("div");
  div.id = "averagePrice";
  div.className = "css-t02s9j active";
  div.style.userSelect = "all";
  //   div.textContent = `Average Price: ${averagePrice}`;
  div.textContent = `${averagePrice}`;
  return div;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const XPathSearch = (x: string) => {
  return document.evaluate(x, document, null, XPathResult.ANY_TYPE, null).iterateNext();
};

const noTrades = () => document.querySelector('.emptyLine')?.textContent;

const myTrades = async () => {
  const selector = "div[name='trades'] .css-13kwpu1 > div:last-child .trade-list-item.trade-list-item-buy";

  let trades = document.querySelectorAll(selector);

  let tradesCount = 0;
  while (!trades.length) {
    await sleep(100);
    trades = document.querySelectorAll(selector);
    tradesCount++;
    // console.log(`${LOG_PREFIX} no trades found, retrying... ${tradesCount}`);
    if (tradesCount > 10 || noTrades()) {
      console.log("No trades found on 'My Trades' tab");
      return;
    }
  }

  // append checkboxes to trades
  for (let i = 0; i < trades.length; i++) {
    const checkbox = createCheckbox(i);
    trades[i].prepend(checkbox);
  }

  let pricess = document.querySelectorAll(`${selector} .price`);
  // remove the last 2
  let prices = [...pricess];
  prices = prices.slice(0, prices.length - 2);

  const amounts = document.querySelectorAll(`${selector} > div:nth-child(2)`);
  const times = document.querySelectorAll(`${selector} > div:nth-child(3)`);

  if (!prices.length || !amounts.length || !times.length) {
    console.error(`${LOG_PREFIX} no trades`);
    console.log("prices", prices);
    console.log("amounts", amounts);
    console.log("times", times);
    return;
  }

  // assert(
  //   prices.length == amounts.length && prices.length == times.length,
  //   `${LOG_PREFIX} prices, amounts and times are not equal`
  // );

  let totalCost = 0;
  let totalAmount = 0;
  for (let i = 0; i < prices.length; i++) {
    let [price, amount, time] = [
      parseFloat(prices[i].textContent as string),
      parseFloat(amounts[i].textContent as string),
      times[i].textContent,
    ];
    console.log(price, amount);
    totalCost += price * amount;
    totalAmount += amount;
  }

  console.log(`${LOG_PREFIX} total cost: ${totalCost}`);
  console.log(`${LOG_PREFIX} total amount: ${totalAmount}`);
  let averagePrice = totalCost / totalAmount;

  // round to 5 decimals
  averagePrice = Math.round((totalCost / totalAmount) * 100000) / 100000;
  console.log(`${LOG_PREFIX} average price: ${averagePrice}`);
  const tabParent = document.querySelector("#tab-1")?.parentElement;
  // remove old span
  document.getElementById("averagePrice")?.remove();
  const div = createDiv(averagePrice);
  tabParent?.append(div);
};

const orderHistory = async (timeRange = '1 Month') => {
  await sleep(500);

  let orderHistoryElem = document.querySelector(orderHistorySelector);

  while (!orderHistoryElem) {
    await sleep(300);
    orderHistoryElem = document.querySelector(orderHistorySelector);
  }
  if (orderHistoryElem instanceof HTMLElement) {
    orderHistoryElem.click();
    await sleep(300);
  }

  const hideOtherPairs = document.querySelector("#order-history-hide-other-pairs");
  if (hideOtherPairs instanceof HTMLInputElement && !hideOtherPairs?.checked) {
    hideOtherPairs?.click();
    // console.log("found hideOtherPairs unchecked");
  }

  const status = document.querySelector('div[title="Status"]');
  if (status instanceof HTMLElement) {
    if (status.textContent !== "Filled") {
      status.click();
      await sleep(100);
      const popper = XPathSearch('//div[@data-popper-reference-hidden="false"]//div[text() = "Filled"]');
      if (popper instanceof HTMLElement) {
        popper?.click();
        await sleep(300);
        // console.log("found Filler popper");
      }
    }
  }
  // const timeRange ='1 Week'
  const timeRangeTab = XPathSearch(`//div[text() = "${timeRange}"]`);
  if (timeRangeTab instanceof HTMLElement) {
    timeRangeTab?.click();
    await sleep(100);
  }

  let table = document.querySelectorAll('div[data-testid="tradeInfoTable"]')[1];

  while (!table) {
    await sleep(100);
    table = document.querySelectorAll('div[data-testid="tradeInfoTable"]')[1];
  }
  // console.log(table);

  const buyOrders = 'div[data-bn-type="text"]:nth-child(5)';
  let rows = table.querySelectorAll(buyOrders);
  while (rows.length === 0) {
    // console.log("waiting for rows");
    await sleep(100);
    rows = table.querySelectorAll(buyOrders);
    // console.log(rows);
  }

  // console.log("waiting for more rows");
  await sleep(300);
  rows = table.querySelectorAll(buyOrders);

  let totalCost = 0;
  let totalAmount = 0;

  // find Buy orders
  table.querySelectorAll(buyOrders)
    .forEach((div, i) => {
      if (div.textContent != "Buy") {
        return;
      }
      const averagePrice: any = div.nextSibling?.textContent?.replace(",", "");
      const executed: any = div.nextSibling?.nextSibling?.nextSibling?.textContent?.replace(",", "");
      console.log('averagePrice', averagePrice);
      if (averagePrice && executed) {
        totalCost += parseFloat(averagePrice) * parseFloat(executed);
        totalAmount += parseFloat(executed);
      }
      // div.closest('.css-vqlpio')
    });
  let averagePrice = totalCost / totalAmount;
  // round to 5 decimals
  averagePrice = Math.round((totalCost / totalAmount) * 100000) / 100000;
  console.log(`${LOG_PREFIX} average price: ${averagePrice}`);
}