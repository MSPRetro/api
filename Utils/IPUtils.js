const { IPModel } = require("./Schemas.js");
const { getValue, setValue } = require("./Globals.js");
const { setError } = require("./ErrorManager.js");
const { getNewId } = require("./Util.js");

const regexIP = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;

function toInt(ip) {
  if (!ip) return 0;
  if (!regexIP.test(ip)) return 0;
  
  return ip.split(".").map((octet, index, array) => {
    return parseInt(octet) * Math.pow(256, (array.length - index - 1));
  }).reduce((prev, curr) => {
    return prev + curr;
  });
};

function toIP(value) {
  if (!value) return 0;

  const result = /\d+/.exec(value);
  if (!result) return 0;

  value = result[0];

  var part1 = value & 255;
  var part2 = ((value >> 8) & 255);
  var part3 = ((value >> 16) & 255);
  var part4 = ((value >> 24) & 255);

  return part4 + "." + part3 + "." + part2 + "." + part1;
}

// No longer used: does not support IPv6, and is tedious to use

exports.ipInt = value => {
  return {
    toInt: () => toInt(value),
    toIP: () => toIP(value)
  };
};

const getIPData = exports.getIPData = async IP => {
  let IPData = getValue(`${IP}-IP`);
  
  if (!IPData) {
    IPData = await IPModel.findOne({ IP: IP });
    
    if (!IPData) {
      let IPId = await getNewId("ip_id") + 1;
      
      const addIP = new IPModel({
        IPId: IPId,
        IP: IP,
        Warns: 0,
        Locked: false
      });
      await addIP.save();
      
      IPData = {
        IPId: IPId,
        IP: IP,
        Warns: 0,
        Locked: false
      };
    };
    
    setValue(`${IP}-IP`, IPData);
  };
  
  return IPData;
}