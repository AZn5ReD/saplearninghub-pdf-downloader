import fs from "fs";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

import constant from "./constants.json";
import config from "./config";

function getURLTemplate() {
  const URLArray = config.DOWNLOAD_URL.split("/");
  URLArray.pop();
  URLArray.push(constant.SVG_URL);
  const URLTemplate = URLArray.join("/");
  console.info("URL Template:", URLTemplate);
  return URLTemplate;
}

export function targetDirCheck() {
  try {
    if (!fs.existsSync(config.TARGET_DIR)) {
      console.info(`Target dir ${config.TARGET_DIR} doesn't exist`);
      fs.mkdirSync(config.TARGET_DIR);
      console.info(`Directory ${config.TARGET_DIR} created`);
    }
    return true;
  } catch (error) {
    console.error("Error while creating folder:", error);
    return false;
  }
}

function getFilePath() {
  let filePath = "";
  const URLArray = config.DOWNLOAD_URL.split("/");
  URLArray.pop();
  let filename = URLArray[URLArray.length - 1] + ".pdf";
  filePath = config.TARGET_DIR + "/" + filename;
  console.info("File path:", filePath);
  return filePath;
}

function initFile(filePath) {
  try {
    PDFDocument.prototype.addSVG = function (svg, x, y, options) {
      return SVGtoPDF(this, svg, x, y, options), this;
    };
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    stream.on("finish", () => {
      process.exit();
    });
    return { doc, stream };
  } catch (error) {
    console.error("Error during file initialisation:", error);
  }
}

async function getLastPage(page) {
  await page.goto(config.DOWNLOAD_URL, { followRedirect: true });
  await page.waitForSelector("#progressIndicator");
  const lastPage = await page.evaluate(() =>
    document.querySelector("#progressIndicator").innerHTML.slice(3)
  );
  console.info("Last page:", lastPage);
  return lastPage;
}

async function goToURL(page, URLTemplate, i) {
  const downloadURL = URLTemplate.replace(constant.TOPIC_VAR, i);
  console.info("Downloading: ", downloadURL);
  const result = await page.goto(downloadURL, { followRedirect: true });
  if (result.status() === 404) {
    console.info("Page doesn't exists");
    return false;
  }
  return true;
}

async function addSVGToPDF(page, doc, i) {
  const svgInline = await page.evaluate(
    () => document.querySelector("svg").outerHTML
  );
  if (i !== 1) doc.addPage();
  doc.addSVG(svgInline, 0, 0);
}

export async function downloadFile(page) {
  console.info("Initialize file");
  const URLTemplate = getURLTemplate();
  const filePath = getFilePath();
  const { doc, stream } = initFile(filePath);
  const lastPage = await getLastPage(page);

  console.info("Starting download...");
  let i = 1;
  while (lastPage ? i <= lastPage : true) {
    try {
      let pageExists = await goToURL(page, URLTemplate, i);
      if (!pageExists) break;
      await addSVGToPDF(page, doc, i);
      i++;
    } catch (error) {
      console.error(error);
      break;
    }
  }

  try {
    doc.pipe(stream);
    doc.end();
    console.info(`File ${filePath} created :)`);
  } catch (error) {
    console.error(error);
    console.error(`File ${filePath} not created :(`);
  }
}
