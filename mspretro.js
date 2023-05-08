require("dotenv").config();

const cluster = require("cluster");
const express = require("express");
const bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);
const cors = require("cors");
const { connect } = require("mongoose");
const { readdir } = require("fs");
const { deleteValue, setValue } = require("./Utils/Globals.js");
const { setError, clearError } = require("./Utils/ErrorManager.js");
const config = require("./config.json");

if (cluster.isMaster) {
  let workers = [ ];
  for (let i = 0; i < config.clusterWorkerSize; i++) workers.push(cluster.fork());

  function messageHandler(msg) {
    if (msg.msg) {
      for (let worker of workers) worker.send(msg);
    }
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on("message", messageHandler);
  }

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
    // res.set("Access-Control-Allow-Origin", "*");
    
    const method = req.method;
    const url = req.path.slice(1);
    
    const data = API[`${url}-${method}`];
    
    if (!data || data.data.Method !== method) return res.sendStatus(404);
    
    return await data.run(req, res);
  })

  app.listen(process.env.PORT, async _ => {
    console.log("The server is starting... - Worker: " + process.pid);
    readdir("./Services/", (error, f) => {
      if (error) return console.error(error);

      let actions = f.filter((f) => f.split(".").pop() === "js");

      actions.forEach((f) => {
        let action = require(`./Services/${f}`);
        
        SOAPActions[action.data.SOAPAction] = action;
        
        if (config.devServer) console.log(`${f} action loaded!`);
      });
      if (config.devServer) console.log(`Loaded ${Object.keys(SOAPActions).length} API's!`);
    });
    
    readdir("./Routes/", (error, f) => {
      if (error) return console.error(error);
      
      let routes = f.filter((f) => f.split(".").pop() === "js");

      routes.forEach((f) => {
        let action = require(`./Routes/${f}`);
        
        API[`${action.data.Name}-${action.data.Method}`] = action;
        
        if (config.devServer) console.log(`${f} routes loaded!`);
      });
      if (config.devServer) console.log(`Loaded ${Object.keys(API).length} routes!`);
    });

    await connect(process.env.CUSTOMCONNSTR_URIMongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => console.log("Connected to MongoDB - Worker: " + process.pid))
      .catch((e) => {
        console.log("An error has occured with MongoDB - Worker: " + process.pid)
        console.error(e);
      }); 
    console.log("The server is online! - Worker: " + process.pid);
    setValue("fmsUpdates", { });
  });
  
  exports.SOAPActions = SOAPActions;
}
