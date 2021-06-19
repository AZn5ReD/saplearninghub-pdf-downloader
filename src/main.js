import puppeteer from "puppeteer";
import config from "./config";
import { login } from "./navigation";
import { downloadFile, targetDirCheck } from "./file";
import processSend from "./process";
const fs=require('fs');

const getWSAddress = () => new Promise(resolve => {
  fs.readFile(config.BASE_PATH + '/wsa.txt', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
      if(err) {
          console.error(err);
          return;
      }
      console.log(data);
      resolve(data);
  });
});

async function initPuppeteer (){
  const wsa = await getWSAddress();
  const browserConfig = {
      browserWSEndpoint :wsa
  };
  const browser = await puppeteer.connect(browserConfig);
  const page = await browser.newPage();
  page.on("dialog", async (dialog) => {
    console.info("Skipping dialog:", dialog.message());
    await dialog.dismiss();
  });
    return { browser, page };
}


export default async function main() {
  const { browser, page } = await initPuppeteer();
  // if (!targetDirCheck() || !(await login(page))) { // 走手动登录
  //   throw new Error("Error during init");
  // }
  await downloadFile(page);

  process.on("exit", (code) => {
    console.info(`Exiting with code ${code}`);
  });
}
