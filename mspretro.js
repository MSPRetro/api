require("dotenv").config();

const cluster = require("cluster");
const { hostname, cpus } = require("os");
const { readdir } = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);
const cors = require("cors");

const { connect } = require("mongoose");
const { BlobServiceClient } = require("@azure/storage-blob");
const { EmailClient } = require("@azure/communication-email");

const { sanitizeJSON } = require("./Utils/Util.js");
const { deleteValue, setValue } = require("./Utils/Globals.js");
const { setError, clearError } = require("./Utils/ErrorManager.js");

if (cluster.isMaster) {
  let workers = [ ];
  
  cpus().forEach(() => workers.push(cluster.fork()));
  
  function messageHandler(msg) {
    if (msg.msg) {
      for (let worker of workers) worker.send(msg);
    }
  }

  for (const id in cluster.workers) cluster.workers[id].on("message", messageHandler);

  cluster.on("exit", function (worker) {
    console.log("Worker", worker.id, " has exitted.");
  });
} else {
  process.on("message", async msg => {
    switch (msg.msg) {
      case "setValueInvoked":
        setValue(msg.data.key, msg.data.value, false);
        
        break;
      case "deleteValueInvoked":
        deleteValue(msg.data.key, false);
        
        break;
      case "setErrorInvoked":
        await setError(msg.data.err, false);
        
        break;
      case "deleteErrorInvoked":
        clearError(false);
        
        break;
    }
  });
  
  const app = express();

  let SOAPActions = { };
  let API = { };

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use("/StripeWebhook", bodyParser.raw({ type: "*/*" }));
  app.use(bodyParser.json());
  app.use(bodyParser.xml());
  app.use(cors());
  
  app.all("*", async (req, res) => {
    const contentType = req.header("Content-Type");
    const url = req.path.slice(1);
        
    // Avoid MongoDB injection
    if ((contentType && url !== "StripeWebhook") && (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("application/json"))) {
      req.body = JSON.parse(JSON.stringify(req.body));
      req.body = sanitizeJSON(req.body);
    }
    
    const method = req.method;
    const data = API[`${url}-${method}`];
    
    if (!data || data.data.Method !== method) return res.sendStatus(404);
    
    res.set("HandledBy", `${hostname()}_${process.pid}`);
    
    return await data.run(req, res);
  });

  app.listen(process.env.PORT, async _ => {
    console.log("The server is starting... - Worker: " + process.pid);
    readdir("./Services/", (error, f) => {
      if (error) return console.error(error);

      let actions = f.filter((f) => f.split(".").pop() === "js");

      actions.forEach((f) => {
        let action = require(`./Services/${f}`);
        
        SOAPActions[action.data.SOAPAction] = action;
        
        if (process.env.DevServer === "true") console.log(`${f} action loaded!`);
      });
      if (process.env.DevServer === "true") console.log(`Loaded ${Object.keys(SOAPActions).length} API's!`);
    });
    
    readdir("./Routes/", (error, f) => {
      if (error) return console.error(error);
      
      let routes = f.filter((f) => f.split(".").pop() === "js");

      routes.forEach((f) => {
        let action = require(`./Routes/${f}`);
        
        API[`${action.data.Name}-${action.data.Method}`] = action;
        
        if (process.env.DevServer === "true") console.log(`${f} routes loaded!`);
      });
      if (process.env.DevServer === "true") console.log(`Loaded ${Object.keys(API).length} routes!`);
    });
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.CUSTOMCONNSTR_AzureBlobStorage);
    exports.containerClient = blobServiceClient.getContainerClient("$web");
    
    exports.emailClient = new EmailClient(process.env.CUSTOMCONNSTR_AzureCommunicationService);
    
    await connect(process.env.CUSTOMCONNSTR_URIMongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB - Worker: " + process.pid))
    .catch(error => {
      console.log("An error has occured with MongoDB - Worker: " + process.pid);
      console.error(error);
    });
    
    console.log("The server is online! - Worker: " + process.pid);
    setValue("fmsUpdates", { });
  });
  
  exports.SOAPActions = SOAPActions;
}