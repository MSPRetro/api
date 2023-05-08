const { getCurrency } = require("locale-currency");
const { IPCountryModel } = require("../Utils/Schemas.js");
const { getCurrencySymbol, buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetBokuPricePoints",
  needTicket: false,
  levelModerator: 0
};

exports.run = async (request, undefined, IP) => {
  let IPasInt;
  let currency = "EUR";
  
  // IPv4
  if (IP.split(".").length == 4) {
    IPasInt = IP.split(".")
      .reduce(function(ipInt, octet) {
        return (ipInt << 8) + parseInt(octet, 10)
      }, 0) >>> 0;
  } // IPv6
  else if (IP.split(":").length == 8) {
    IPasInt = IP.split(":")
      .map(str => Number("0x" + str))
      .reduce(function(int, value) {
        return BigInt(int) * BigInt(65536) + BigInt(+value)
      });
  }

  try {
    const IPData = await IPCountryModel.findOne({ ip_range_start: { $lte: parseInt(IPasInt) } })
    .sort({ ip_range_start:  -1 });
  
    if (IPData.country_code) currency = getCurrency(IPData.country_code);
  } catch {
    // unable to detect the IP location, so we show the default currency as EUR
  }
  
  const prices = getPricesByCurrency(currency);
  
  return buildXML("GetBokuPricePoints", {
    country: currency,
    currency: currency,
    currencySymbol: getCurrencySymbol(currency).symbol, //"€",
    currencySymbolOrientation: getCurrencySymbol(currency).orientation, // R or L
    keyPriceArray: {
      // Price in cents
      KeyPrice: [ /* {
        key: "1000", // 1 week VIP
        price: 500
      }, */
      {
        key: "2000", // 1 week VIP
        price: prices["2000"]
      },
      {
        key: "3000", // 1 month VIP
        price: prices["3000"]
      },
      {
        key: "6000", // 1 year VIP
        price: prices["6000"]
      },
      {
        key: "14000", // 3 months VIP
        price: prices["14000"]
      },
      {
        key: "2001", // 10.000 StarCoins
        price: prices["2001"]
      },
      {
        key: "3001", // 50.000 StarCoins
        price: prices["3001"]
      },
      {
        key: "6001", // 400.000 StarCoins
        price: prices["6001"]
      },
      {
        key: "14001", // 1.000.000 StarCoins
        price: prices["14001"]
      }]
    }
  });
}

function getPricesByCurrency(currency) {
  switch (currency) {
    default:
    case "EUR":
      return {
        2000: 500,
        3000: 1200,
        6000: 7000,
        14000: 3300,
        2001: 500,
        3001: 1000,
        6001: 2000,
        14001: 3500
      };
    case "PLN":
      return {
        2000: 2400,
        3000: 5700,
        6000: 33100,
        14000: 15600,
        2001: 2400,
        3001: 4750,
        6001: 9450,
        14001: 16550
      };
    case "GBP":
      return {
        2000: 450,
        3000: 1050,
        6000: 6150,
        14000: 2900,
        2001: 450,
        3001: 1150,
        6001: 1750,
        14001: 3100
      };
    case "TRY":
      return {
        2000: 10200,
        3000: 24500,
        6000: 142900,
        14000: 67400,
        2001: 10200,
        3001: 20450,
        6001: 40850,
        14001: 71450
      };
    case "USD":
      return {
        2000: 550,
        3000: 1300,
        6000: 7600,
        14000: 3600,
        2001: 550,
        3001: 1100,
        6001: 2200,
        14001: 3800
      }
    case "AUD":
      return {
        2000: 800,
        3000: 1900,
        6000: 10900,
        14000: 5150,
        2001: 800,
        3001: 1600,
        6001: 3200,
        14001: 5600
      }
  }
}

/*
                if (btn == btnPay1weekSpecialOffer)
                {
                    key = "1000";
                    desc = "1 week VIP + 500 StarCoins";
                };
                if (btn == btnPay1week)
                {
                    key = "2000";
                    desc = "1 week VIP + 750 StarCoins";
                };
                if (btn == btnPay2weeks)
                {
                    key = "3000";
                    desc = "2 weeks VIP + 2000 StarCoins";
                };
                if (btn == btnPay1month)
                {
                    key = "6000";
                    desc = "1 month VIP + 6000 StarCoins";
                };
                if (btn == btnPay3month)
                {
                    key = "14000";
                    desc = "3 months VIP + 15000 StarCoins";
                    _local_1 = false;
                };
                if (btn == btnPay1weekStarcoins)
                {
                    key = "2001";
                    desc = "1000 StarCoins";
                };
                if (btn == btnPay2weeksStarcoins)
                {
                    key = "3001";
                    desc = "2500 StarCoins";
                };
                if (btn == btnPay1monthStarcoins)
                {
                    key = "6001";
                    desc = "7500 StarCoins";
                };
                if (btn == btnPay3monthStarcoins)
                {
                    key = "14001";
                    desc = "20000 StarCoins";
                    _local_1 = false;
                };
                */