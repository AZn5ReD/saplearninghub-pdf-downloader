import fs from "fs";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const configFile =
  process.env.NODE_ENV === "test" ? "./config_test.json" : "./config.json";
let config = {};

try {
  config = JSON.parse(fs.readFileSync(configFile));
} catch (error) {
  console.error("Error while reading config file:", error);
}

export default {
  DOWNLOAD_URL: argv.url ? argv.url : config.DOWNLOAD_URL,
  LOGIN: argv.login ? argv.login : config.LOGIN,
  PASSWORD: argv.password ? argv.password : config.PASSWORD,
  TARGET_DIR: argv.target ? argv.target : config.TARGET_DIR,
  DEBUG: argv.debug ? argv.debug : config.DEBUG,
};
