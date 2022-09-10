import mainWorld from "./content-main-world?script&module";
const PREFIX = "MBAP";
const LOG_PREFIX = "My Binance Average Price:";

const script = document.createElement("script");
script.src = chrome.runtime.getURL(mainWorld);
script.type = "module";
script.addEventListener("load", async (a) => {
  console.log("script loaded", a);

  let tab = document.querySelector("#tab-1");

  while (!tab) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    tab = document.querySelector("#tab-1");
  }
  console.log("found tab");
  //  1. click on My Trades
  // @ts-ignore
  document.querySelector("#tab-1")?.click();
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // Get trades
  const selector = "div[name='trades'] .css-13kwpu1 > div:last-child .trade-list-item.trade-list-item-buy";

  // append checkboxes to trades
  for (let i = 0; i < document.querySelectorAll(selector).length; i++) {
    const checkbox = createCheckbox(i);
    document.querySelectorAll(selector)[i].prepend(checkbox);
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
      // @ts-ignore
      parseFloat(prices[i].textContent),
      // @ts-ignore
      parseFloat(amounts[i].textContent),
      times[i].textContent,
    ];
    console.log(price, amount);
    totalCost += price * amount;
    totalAmount += amount;
  }

  console.log(`${LOG_PREFIX} total cost: ${totalCost}`);
  console.log(`${LOG_PREFIX} total amount: ${totalAmount}`);
  const averagePrice = totalCost / totalAmount;
  console.log(`${LOG_PREFIX} average price: ${averagePrice}`);
  const tabParent = document.querySelector("#tab-1")?.parentElement;
  // remove old span
  document.getElementById("averagePrice")?.remove();
  const div = createDiv(averagePrice);
  tabParent?.append(div);
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
  //   div.textContent = `Average Price: ${averagePrice}`;
  div.textContent = `${averagePrice}`;
  return div;
};
