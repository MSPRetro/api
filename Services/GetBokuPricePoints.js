const { getCurrency } = require("locale-currency");
const { IPCountryModel, priceModel } = require("../Utils/Schemas.js");
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
  
  let prices = await priceModel.aggregate([
    { $match: { Currency: currency } },
    {
      $group: {
        _id: "$Key",
        Price: { $last: { $multiply: ["$Price", 100] } }
      }
    },
    {
      $group: {
        _id: null,
        keyPricePairs: {
          $push: {
            k: "$_id",
            v: "$Price"
          }
        }
      }
    },
    {
      $replaceRoot: {
        newRoot: { $arrayToObject: "$keyPricePairs" }
      }
    }
  ]);
  
  prices = prices[0];
  
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