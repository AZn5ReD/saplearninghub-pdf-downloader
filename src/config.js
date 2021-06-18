import fs from "fs";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2), { boolean: ["debug", "child"] });
const configFile =
  process.env.NODE_ENV === "development"
    ? "./config_test.json"
    : "./config.json";
let config = {};

try {
  if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile));
  }
} catch (error) {
  console.error("Error while reading config file:", error);
}

export default {
  DOWNLOAD_URL: argv.url ? argv.url : config.DOWNLOAD_URL,
  LOGIN: argv.login ? argv.login : config.LOGIN,
  PASSWORD: argv.password ? argv.password : config.PASSWORD,
  TARGET_DIR: argv.target ? argv.target : config.TARGET_DIR,
  DEBUG: argv.debug ? argv.debug : config.DEBUG,
  CHROME_EXE: argv.chrome ? argv.chrome : config.CHROME_EXE,
  CHILD_STREAM: argv.stream ? argv.stream : config.CHILD_STREAM,
  FONT_PATH: argv.fontPath ? argv.fontPath : config.FONT_PATH,
  BASE_PATH: argv.basePath ? argv.basePath : config.BASE_PATH,
};
