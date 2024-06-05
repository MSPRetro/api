const xml2js = require("xml2js");
const { setError } = require("./ErrorManager.js");

exports.buildXML = (action, object, ticket = "null") => {
  let obj = {
    "soap:Envelope": {
      $: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/"
      },
      "soap:Body": { }
    }
  };
  
  if (ticket != "null") {
    obj["soap:Envelope"]["soap:Header"] = {
      TicketHeader: {
        $: {
          xmlns: "http://moviestarplanet.com/"
        },
        Ticket: ticket
      }
    };
  }
  
  obj["soap:Envelope"]["soap:Body"][action + "Response"] = {
    $: {
      xmlns: "http://moviestarplanet.com/"
    }
  };
  obj["soap:Envelope"]["soap:Body"][action + "Response"][ action + "Result" ] = object;
  
  return new xml2js.Builder().buildObject(obj);
};

exports.buildXMLnull = (action, ticket = "null") => {
  let obj = {
    "soap:Envelope": {
      $: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/"
      },
      "soap:Body": { }
    }
  };
  
  if (ticket != "null") {
    obj["soap:Envelope"]["soap:Header"] = {
      TicketHeader: {
        $: {
          xmlns: "http://moviestarplanet.com/"
        },
        Ticket: ticket
      }
    };
  }
  
  obj["soap:Envelope"]["soap:Body"][action + "Response"] = {
    $: {
      xmlns: "http://moviestarplanet.com/"
    }
  };
  return new xml2js.Builder().buildObject(obj);
};

const sanitizeJSON = exports.sanitizeJSON = (v) => {
  if (v instanceof Object) {
    for (let key in v) {
      if (/^\$/.test(key)) delete v[key];
      else sanitizeJSON(v[key]);
    }
  }
  
  return v;
}

exports.parseRawXml = xmlObj => {
  try {
    var body = xmlObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0];
    if (body == "" || body == null) {
      return "";
    }
    body = body[Object.keys(body)[0]];
    var result = loopXmlData(body);
    if (xmlObj["SOAP-ENV:Envelope"].hasOwnProperty("SOAP-ENV:Header")) {
      result["TicketHeader"] = {
        Ticket: xmlObj["SOAP-ENV:Envelope"]["SOAP-ENV:Header"][0]["tns:TicketHeader"][0]["tns:Ticket"][0]
      };
    }
    return result;
  } catch {
    setError("Parse raw XML got weird response, please contact the devs.\n" + xmlObj.toString());
    return "ERROR";
  }
};

function loopXmlData(xml) {
  if (Array.isArray(xml) && xml.length == 1) {
    if (typeof xml[0] === "object" && xml[0] !== null) return loopXmlData(xml[0]);

    if (xml[0] == "false" || xml[0] == "true") return xml[0] == "true";
    if (xml[0] == null) return null;
    if (!isNaN(xml[0])) return parseInt(xml[0]);
    
    return xml[0];
  };
  
  if (Array.isArray(xml)) {
    let result = [];
    
    for (let element of xml) {
      if (typeof element === "object" && element !== null) {
        result.push(loopXmlData(element));
        
        continue;
      }
      
      if (element == "false" || element == "true") {
        result.push((element == "true"));
        
        continue;
      }
      
      if (element == null) {  
        result.push(null);
        
        continue;
      }

      if (!isNaN(element)) {
        result.push(parseInt(element));
        
        continue;
      }
      
      let res = loopXmlData(loopXmlData);
      if (res == null) continue;        
      
      result.push(res);
    }
    return result;
  }

  if (typeof xml === "object" && xml !== null) {
    let output = { };
    
    for (let name in xml) {
      if (name == "$") continue;
      
      let result = loopXmlData(xml[name]);
      if (typeof result === "object" && result !== null && Object.keys(result).length == 0) result = null;
      
      output[name.replace(new RegExp("tns:"), "")] = result;
    }
    
    return output;
  }
  
  return null;
}