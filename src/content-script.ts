// @ts-ignore
import mainWorld from "./content-main-world?script&module";
const PREFIX = "MBAP";
const LOG_PREFIX = "MBAP:";

const orderHistorySelector = '[data-testid="OrderHistory"]';

const script = document.createElement("script");
script.src = chrome.runtime.getURL(mainWorld);
script.type = "module";
script.addEventListener("load", async () => {
  console.log("script loaded");

  if (document.querySelector('#header_login')) {
    console.log('not logged in');
    return;
  }

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

  if (noBuyOrSellInMyTrades()) {
    console.log("no trades");
  } else {
    // Get trades from My Trades tab
    myTrades()
  }
  addRefreshButtonToMyTrades();

  // 2. Order History
  await sleep(500);
  orderHistory('1 Month');

  await sleep(500);

  addRefreshButtonToOrderHistory();
});

script.addEventListener("error", (err) => {
  console.log("script error");
  console.error(err);
});
console.log("starting script");
document.head.append(script);

// filter
// -url:https://bin.bnbstatic.com/static-br/static/chunks/bnc~pl~1.bc97a5ce.js -url:https://o529943.ingest.sentry.io/api/5684836/envelope/?sentry_key=98cacb9d46384ac4abd400761cf7002e&sentry_version=7 -url:https://bin.bnbstatic.com/static/fiat-activation-ui/fiat-activation-widget.9d3e3cf.js -url:https://www.binance.com/en/trade/ANC_USDT?theme=dark&type=isolated -url:https://api.saasexch.com/bapi/fe/usd/sa.gif?project=binance -url:https://bin.bnbstatic.com/static-br/static/chunks/common2.fd3a05d1.js

const createCheckbox = (type: string) => {
  var newCheckBox = document.createElement("input");
  newCheckBox.type = "checkbox";
  newCheckBox.className = `${PREFIX}-${type}`;
  // newCheckBox.value = check_value[count] + '<br/>';
  return newCheckBox;
};

const recalculateMyTrades = (type: string) => {
  let totalCost = 0;
  let totalAmount = 0;
  // if there are any checked checkboxes of the opposite type, uncheck them
  document.querySelectorAll(`input.${PREFIX}-${type === 'buy-my-trades' ? 'sell-my-trades' : 'buy-my-trades'}[type=checkbox]:checked`).forEach((checkbox) =>
    (checkbox as HTMLInputElement).checked = false
  );
  // get all checked checkboxes
  document.querySelectorAll(`input.${PREFIX}-${type}[type=checkbox]:checked`).forEach((checkbox) => {

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

    // round to 5 decimals
    const averagePrice = Math.round((totalCost / totalAmount) * 100000) / 100000;
    console.log(`${LOG_PREFIX} average price: ${averagePrice}`);
    const tabParent = document.querySelector("#tab-1")?.parentElement;
    const div = createPriceDiv(averagePrice, 'averagePrice');
    tabParent?.append(div);
  });
};

const createPriceDiv = (averagePrice: number, id: string) => {
  // remove old div
  document.getElementById(id)?.remove();

  const div = document.createElement("div");
  div.id = id;
  div.className = "css-t02s9j active";
  div.style.userSelect = "all";
  //   div.textContent = `Average Price: ${averagePrice}`;
  div.textContent = `${averagePrice}`;
  return div;
};

const addRefreshButtonToMyTrades = () => {
  const tabParent = document.querySelector("#tab-1")?.parentElement;
  const refreshButton = createRefreshButton()

  refreshButton.onclick = () => {
    console.log("refreshing");
    // remove all checkbox elements
    document.querySelectorAll(`input.${PREFIX}-buy-my-trades, input.${PREFIX}-sell-my-trades`).forEach((checkbox) => checkbox.remove());
    myTrades();
  };
  tabParent?.append(refreshButton);
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const XPathSearch = (x: string) => {
  return document.evaluate(x, document, null, XPathResult.ANY_TYPE, null).iterateNext();
};

const noBuyOrSellInMyTrades = () => document.querySelector('.emptyLine')?.textContent;

const myTrades = async () => {
  const buySelector = "div[name='trades'] .css-13kwpu1 > div:last-child .trade-list-item.trade-list-item-buy";
  const sellSelector = "div[name='trades'] .css-13kwpu1 > div:last-child .trade-list-item.trade-list-item-sell";

  let buyTrades = document.querySelectorAll(buySelector);
  let sellTrades = document.querySelectorAll(sellSelector);

  let retry = 0;
  while (!buyTrades.length || !sellTrades.length) {
    await sleep(100);
    buyTrades = document.querySelectorAll(buySelector);
    sellTrades = document.querySelectorAll(sellSelector);
    retry++;
    // console.log(`${LOG_PREFIX} no trades found, retrying... ${retry}`);
    if (retry > 10 || noBuyOrSellInMyTrades()) {
      console.log("No trades found on 'My Trades' tab");
      return;
    }
  }

  // append checkboxes to the buy trades
  for (let i = 0; i < buyTrades.length; i++) {
    const checkbox = createCheckbox('buy-my-trades');
    checkbox.onchange = () => {
      recalculateMyTrades('buy-my-trades');
    };
    buyTrades[i].prepend(checkbox);
  }

  // append checkboxes to the sell trades
  for (let i = 0; i < sellTrades.length; i++) {
    const checkbox = createCheckbox('sell-my-trades');
    checkbox.onchange = () => {
      recalculateMyTrades('sell-my-trades');
    };
    sellTrades[i].prepend(checkbox);
  }

  const prices = document.querySelectorAll(`${buySelector} .price`);

  const amounts = document.querySelectorAll(`${buySelector} > div:nth-child(2)`);
  const times = document.querySelectorAll(`${buySelector} > div:nth-child(3)`);

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

  console.log(`${LOG_PREFIX} BUY total cost: ${totalCost}`);
  console.log(`${LOG_PREFIX} BUY total amount: ${totalAmount}`);

  // round to 5 decimals
  const averagePrice = Math.round((totalCost / totalAmount) * 100000) / 100000;
  console.log(`${LOG_PREFIX} BUY average price: ${averagePrice}`);

  const tabParent = document.querySelector("#tab-1")?.parentElement;
  const div = createPriceDiv(averagePrice, 'averagePrice');
  tabParent?.append(div);
};

const orderHistory = async (timeRange = '1 Month') => {
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

  const orders = 'div[data-bn-type="text"]:nth-child(5)';
  let rows = table.querySelectorAll(orders);
  while (rows.length === 0) {
    // console.log("waiting for rows");
    await sleep(100);
    rows = table.querySelectorAll(orders);
    // console.log(rows);
  }

  let totalCost = 0;
  let totalAmount = 0;

  // find Buy orders
  table.querySelectorAll(orders)
    .forEach((div, i) => {
      // if (div.textContent != "Buy") {
      //   return;
      // }
      // add checkbox at the beginning of the row
      let checkbox;
      if (div.textContent == "Buy") {
        checkbox = createCheckbox('buy-order-history');
        checkbox.onchange = () => {
          recalculateOrderHistory('buy-order-history');
        };
      } else if (div.textContent == "Sell") {
        checkbox = createCheckbox('sell-order-history');
        checkbox.onchange = () => {
          recalculateOrderHistory('sell-order-history');
        };
      }
      if (checkbox instanceof HTMLInputElement) {
        div.parentElement?.prepend(checkbox);
      }

      const averagePrice: any = div.nextSibling?.textContent?.replace(",", "");
      const executed: any = div.nextSibling?.nextSibling?.nextSibling?.textContent?.replace(",", "");
      if (averagePrice && executed) {
        totalCost += parseFloat(averagePrice) * parseFloat(executed);
        totalAmount += parseFloat(executed);
      }
    });
  // round to 5 decimals
  const averagePrice = Math.round((totalCost / totalAmount) * 100000) / 100000;
  console.log(`${LOG_PREFIX} BUY average price: ${averagePrice}`);
  const tabParent = document.querySelector("#tab-1")?.parentElement;
  const div = createPriceDiv(averagePrice, 'averagePrice');
  tabParent?.append(div);
}

const recalculateOrderHistory = (type: string) => {
  // uncheck all the opposite checkboxes
  const oppositeType = type === 'buy-order-history' ? 'sell-order-history' : 'buy-order-history';
  document.querySelectorAll(`input.${PREFIX}-${oppositeType}[type="checkbox"]:checked`).forEach((checkbox) => {
    (checkbox as HTMLInputElement).checked = false;
  });

  let totalCost = 0;
  let totalAmount = 0;
  document.querySelectorAll(`input.${PREFIX}-${type}[type=checkbox]:checked`).forEach((checkbox) => {

    const total: any = checkbox.parentElement?.querySelector('div[data-bn-type="text"]:nth-child(11)')?.textContent?.replace(",", "");
    const executed: any = checkbox.parentElement?.querySelector('div[data-bn-type="text"]:nth-child(9)')?.textContent?.replace(",", "");

    totalCost += parseFloat(total);
    totalAmount += parseFloat(executed);
  })
  console.log('totalCost', totalCost);
  console.log('totalAmount', totalAmount);
  // round to 5 decimals
  const averagePrice = Math.round((totalCost / totalAmount) * 100000) / 100000;
  console.log(`${LOG_PREFIX} ${type} average price: ${averagePrice}`);
  // const tabParent = document.querySelector("#tab-1")?.parentElement;

  const dataTable = document.querySelectorAll('[data-testid="DataTable"]')[1].querySelector('div > div');
  const div = createPriceDiv(averagePrice, 'averagePrice-order-history');
  dataTable?.append(div);
}


const addRefreshButtonToOrderHistory = () => {
  const refreshButton = createRefreshButton()

  refreshButton.onclick = () => {
    console.log("refreshing order history");
    orderHistory();
  };
  const dataTable = document.querySelectorAll('[data-testid="DataTable"]')[1].querySelector('div > div');
  dataTable?.append(refreshButton);
};


const createRefreshButton = () => {
  const refreshButton = document.createElement("button");
  refreshButton.textContent = "🔄";

  // reset default browser style
  refreshButton.style.backgroundColor = "transparent";
  refreshButton.style.border = "none";
  refreshButton.style.outline = "none";
  refreshButton.style.cursor = "pointer";
  refreshButton.style.paddingLeft = "0";
  refreshButton.style.margin = "0";

  return refreshButton;
}