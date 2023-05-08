const { IPModel } = require("./Schemas.js");
const { getValue, setValue } = require("./Globals.js");
const { setError } = require("./ErrorManager.js");
const { getNewId } = require("./Util.js");
const fetch = require("node-fetch");

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

exports.getIPDatas = async IP => {
  let IPDatas = getValue(`${IP}-IP`);
  
  if (!IPDatas) {
    IPDatas = await IPModel.findOne({ IP: IP });
        
    if (!IPDatas) {
      const responseAPI = await fetch(`http://check.getipintel.net/check.php?ip=${IP}&contact=mspretro@gmail.com&format=json`)
      .then(res => res.json())
      .catch(() => {
        setError(`We could not ask our provider if your IP is a VPN or a proxy. Please contact us on our Discord to unblock the situation\n\n[Your IP]: ${IP}`);
        return "errorProvider";
      });
      
      let locked = false;
      if (parseFloat(responseAPI.result) >= 0.90) locked = true;
      
      let IPId = await getNewId("ip_id") + 1;
      
      const addIP = new IPModel({
        IPId: IPId,
        IP: IP,
        Score: parseFloat(responseAPI.result),
        Warns: 0,
        Locked: locked
      });
      await addIP.save();
      
      IPDatas = {
        IPId: IPId,
        IP: IP,
        Score: parseFloat(responseAPI.result),
        Warns: 0,
        Locked: locked
      };
    } else setValue(`${IP}-IP`);
  };
    
  if (IPDatas.Locked) {
    setError(`Your connection has been blocked because you are using a VPN/Proxy.\nPlease disable it, then try again.\n\nIf this doesn't work, please contact us by opening a ticket on our Discord server, specifying your IP number.\n\n[IP]: ${IPDatas.IPId}`);
    
    return "blocked";
  } else return "authorized";
}