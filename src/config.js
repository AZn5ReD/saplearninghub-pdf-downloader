import minimist from "minimist";
import config from "../config.json";

const argv = minimist(process.argv.slice(2));

export default {
  DOWNLOAD_URL: argv.url ? argv.url : config.DOWNLOAD_URL,
  LOGIN: argv.login ? argv.login : config.LOGIN,
  PASSWORD: argv.password ? argv.password : config.PASSWORD,
  TARGET_DIR: argv.target ? argv.target : config.TARGET_DIR,
  DEBUG: argv.debug ? argv.debug : config.DEBUG,
};
