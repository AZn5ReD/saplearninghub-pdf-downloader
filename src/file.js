import fs from "fs";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import constant from "./constants.json";
import config from "./config";
import processSend from "./process";

function getURLTemplate() {
  const URLArray = config.DOWNLOAD_URL.split("/");
  URLArray.pop();
  URLArray.push(constant.SVG_URL);
  const URLTemplate = URLArray.join("/");
  console.info("URL Template:", URLTemplate);
  return URLTemplate;
}

export function targetDirCheck() {
  if (config.CHILD_STREAM) {
    console.info(`Used as child stream, no folder needed`);
    return true;
  }
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
  const URLArray = config.DOWNLOAD_URL.split("/");
  URLArray.pop();
  let filename = URLArray[URLArray.length - 1] + ".pdf";
  const filePath = config.CHILD_STREAM
    ? filename
    : config.TARGET_DIR + "/" + filename;
  console.info("File path:", filePath);
  return filePath;
}

function initFile(filePath) {
  try {
    PDFDocument.prototype.addSVG = function (svg, x, y, options) {
      return SVGtoPDF(this, svg, x, y, {
        ...options,
        fontCallback: () => config.FONT_PATH
      }), this;
    };
    const doc = new PDFDocument();
    const stream = config.CHILD_STREAM
      ? fs.createWriteStream(null, { fd: 3 })
      : fs.createWriteStream(filePath);
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
  processSend({ maximum: lastPage });
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
  processSend({ log: "Initializing file" });
  const URLTemplate = getURLTemplate();
  const filePath = getFilePath();
  const { doc, stream } = initFile(filePath);
  const lastPage = await getLastPage(page);

  console.info("Starting download...");
  processSend({ log: "Downloading..." });
  processSend({ filename: filePath });
  let i = 1;
  while (lastPage ? i <= lastPage : true) {
    try {
      let pageExists = await goToURL(page, URLTemplate, i);
      if (!pageExists) break;
      await addSVGToPDF(page, doc, i);
      processSend({ progress: i });
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
    processSend({ log: "File downloaded !" });
  } catch (error) {
    console.error(error);
    console.error(`File ${filePath} not created :(`);
    processSend({ log: "Error while downloading file" });
  }
}
