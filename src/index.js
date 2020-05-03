import puppeteer from "puppeteer";
import config from "./config";
import { login, getAuthorization } from "./navigation";
import { downloadFile } from "./file";

async function initPuppeteer() {
  try {
    console.info("Starting script...");
    const browser = await puppeteer.launch({
      args: ["--disable-features=site-per-process"],
      headless: !config.DEBUG,
    });
    const page = await browser.newPage();
    return { browser, page };
  } catch (error) {
    console.error("Error during puppeteer initialisation:", error);
  }
}

async function main() {
  console.log(config.DEBUG);
  const { browser, page } = await initPuppeteer();
  const connected = await login(page);
  if (!connected) {
    return;
  }
  await getAuthorization(page);
  await downloadFile(page);
}

main();
