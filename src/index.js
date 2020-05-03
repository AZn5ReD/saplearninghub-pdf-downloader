import puppeteer from "puppeteer";
import constant from "./constants.json";
import config from "../config.json"; // TODO Use CLI args ?

async function initPuppeteer() {
  try {
    console.info("Starting script...");
    const browser = await puppeteer.launch({
      args: ["--disable-features=site-per-process"],
      //   headless: false,
    });
    const page = await browser.newPage();
    return page;
  } catch (e) {
    console.error("Error during puppeteer initialisation:", e);
  }
}

async function login(page) {
  try {
    console.info("Going to:", constant.LEARNINGHUB_URL);
    await page.goto(constant.LEARNINGHUB_URL, { followRedirect: true });
    await page.waitForSelector(constant.LOGIN_SELECTOR, {
      visible: true,
    });

    console.info("Entering login:", config.LOGIN);
    await page.type(constant.LOGIN_SELECTOR, config.LOGIN);
    await page.click(constant.SUBMIT_SELECTOR);

    console.info("Entering password: ***");
    await page.type(constant.PASSWORD_SELECTOR, config.PASSWORD);
    await page.click(constant.SUBMIT_SELECTOR);

    console.log("Submiting...");
    await page.waitForNavigation();
    console.info("Redirected to:", page.url());
    await page.waitForNavigation();
    console.info("Redirected to", page.url());

    if (page.url() === constant.URL_CONNECTED) {
      console.info("Connected :)");
      return true;
    } else {
      console.error("Can't connect :(");
      return false;
    }
  } catch (e) {
    console.error("Error during login:", e);
  }
}

async function main() {
  const page = await initPuppeteer();
  const connected = await login(page);
  if (!connected) {
    return;
  }

  const frame = await page
    .mainFrame()
    .childFrames()
    .find((f) => {
      return f.name().startsWith("pop-frame") ? f : null;
    });
  await frame.waitForSelector("a[class='call']");
  await frame.click("a[class='call']");

  await page.waitForNavigation();
  //   const links = await page.$$("a[href^='https://performancemanager']");
  //   for (let link in links) {
  //     console.log(link);
  //   }
  //   await links[1].click();

  await page.mainFrame().waitForSelector("a[href^='https://performance']");
  await page.click("a[target='_blank']");
}

main();
