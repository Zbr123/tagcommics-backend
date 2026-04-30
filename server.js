require("dotenv").config();
require("./src/models/associations");

const buildApp = require("./_app");
const { syncModels } = require("./src/utils/sync-models");

async function start() {
  const app = await buildApp();

  await syncModels();

  app.listen({
    port: process.env.PORT,
    host: process.env.SERVER_HOST,
  });

  console.log("Server started");
}

start();