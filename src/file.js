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

function getFilePath() {
  let filePath = "";
  const URLArray = config.DOWNLOAD_URL.split("/");
  URLArray.pop();
  let filename = URLArray[URLArray.length - 1] + ".pdf";
  if (!fs.existsSync(config.TARGET_DIR)) {
    console.error("Target path doesn't exist");
    return filePath;
  }
  filePath = config.TARGET_DIR + filename;
  console.info("File path:", filePath);
  return filePath;
}

function initFile(filePath) {
  PDFDocument.prototype.addSVG = function (svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options), this;
  };
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  return { doc, stream };
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
  console.info("Initialise file");
  const URLTemplate = getURLTemplate();
  const filePath = getFilePath();
  const { doc, stream } = initFile(filePath);

  console.info("Starting download...");
  let i = 1;
  while (true) {
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
