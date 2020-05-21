import constant from "./constants.json";
import config from "./config";
import processSend from "./process";

async function redirection(page) {
  console.info("Redirected to:", page.url());
  await page.waitForNavigation({
    waitUntil: "networkidle0",
  });
}

export async function login(page) {
  try {
    console.info("Going to:", constant.LEARNINGHUB_URL);
    processSend({ log: "Connecting..." });
    await page.goto(constant.LEARNINGHUB_URL, { followRedirect: true });
    await page.waitForSelector(constant.LOGIN_SELECTOR, {
      visible: true,
    });

    console.info("Entering login:", config.LOGIN);
    await page.type(constant.LOGIN_SELECTOR, config.LOGIN);
    await page.click(constant.SUBMIT_SELECTOR);

    console.info("Entering password: ***");
    await page.waitForSelector(constant.PASSWORD_SELECTOR, {
      visible: true,
    });
    await page.type(constant.PASSWORD_SELECTOR, config.PASSWORD);

    console.info("Submiting...");
    await Promise.all([
      page.click(constant.SUBMIT_SELECTOR),
      redirection(page),
    ]);
    if (page.url().startsWith("https://accounts.sap.com/")) {
      throw new Error("Login failed :(");
    }
    await redirection(page);

    if (page.url() === constant.URL_CONNECTED) {
      console.info("Connected :)");
      return true;
    } else {
      console.error("Can't connect :(");
      return false;
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

async function cookiePopup(page) {
  try {
    const frame = await page
      .mainFrame()
      .childFrames()
      .find((f) => {
        return f.name().startsWith("pop-frame") ? f : null;
      });
    if (!frame) {
      console.info("No cookie consent");
      return;
    }
    await frame.waitForSelector("a[class='call']");
    await frame.click("a[class='call']");
    console.info("Cookie accepted");
    await page.waitForNavigation();
  } catch (error) {
    console.error("Error during cookie consent:", error);
  }
}

async function navToSF(page) {
  try {
    console.info(`Navigating to SuccessFactor`);
    const links = await page.$$(constant.SUCCESS_FACTOR_LINK_SELECTOR);
    if (links.length <= 0) {
      console.error("Can't find SuccessFactor Link");
      return;
    }
    await page.evaluateHandle((el) => {
      el.target = "_self";
    }, links[0]);
    await links[0].click();
    await redirection(page);
  } catch (error) {
    console.error("Error while navToSF", error);
  }
}

export async function getAuthorization(page) {
  processSend({ log: "Authentication..." });
  await cookiePopup(page);
  await navToSF(page);
}
