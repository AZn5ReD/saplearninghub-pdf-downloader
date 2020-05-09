import {
  QMainWindow,
  QWidget,
  QLabel,
  FlexLayout,
  QPushButton,
  QFileDialog,
  QLineEdit,
  QToolButton,
  QIcon,
  EchoMode,
  FileMode,
  QPlainTextEdit,
  QProgressBar,
} from "@nodegui/nodegui";

import child_process from "child_process";

const defaultWidgetStyle = `
    padding: 5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
`;

function createWidget(rootLayout) {
  const widget = new QWidget();
  widget.setInlineStyle(defaultWidgetStyle);
  rootLayout.addWidget(widget);
  return widget;
}

function createLayout(widget) {
  const layout = new FlexLayout();
  layout.setFlexNode(widget.getFlexNode());
  widget.setLayout(layout);
  return layout;
}

function createWindow() {
  const win = new QMainWindow();
  win.setWindowTitle("SAP LearningHub PDF Downloader");
  win.setMinimumSize(600, 400);

  const centralWidget = new QWidget();
  centralWidget.setObjectName("rootView");

  const rootLayout = new FlexLayout();
  centralWidget.setLayout(rootLayout);

  win.setCentralWidget(centralWidget);
  win.setStyleSheet(`
    #rootView {
      padding: 5px;
      height: '100%';
      justify-content: 'center';
      width: '100%';
    }
  `);
  return { win, rootLayout };
}

function createInput(rootLayout, labelText) {
  const widget = createWidget(rootLayout);
  const layout = createLayout(widget);

  const label = new QLabel();
  label.setText(labelText);
  label.setInlineStyle(`
    padding-right: 2px;
  `);

  const input = new QLineEdit();
  input.setInlineStyle(`
    flex: 1;
  `);

  layout.addWidget(label);
  layout.addWidget(input);
  return input;
}

function createDirectoryInput(rootLayout, labelText) {
  const widget = createWidget(rootLayout);
  const layout = createLayout(widget);

  const label = new QLabel();
  label.setText(labelText);
  label.setInlineStyle(`
    padding-right: 2px;
  `);

  const input = new QLineEdit();
  input.setInlineStyle(`
    flex: 1;
  `);

  const button = new QToolButton();
  // TODO Icon not working
  button.setIcon(new QIcon("../images/icon_directory.png"));
  button.addEventListener("clicked", () => {
    const fileDialog = new QFileDialog();
    fileDialog.setFileMode(FileMode.Directory);
    fileDialog.exec();
    input.setText(fileDialog.selectedFiles()[0]);
  });

  layout.addWidget(label);
  layout.addWidget(input);
  layout.addWidget(button);
  return input;
}

function createProgressBar(rootLayout) {
  const widget = createWidget(rootLayout);
  widget.setInlineStyle(`
    ${defaultWidgetStyle}
    flex: 1;
  `);

  const layout = createLayout(widget);

  const progress = new QProgressBar();
  progress.setInlineStyle(`
    flex: 1;
  `);
  progress.setMinimum(0);

  layout.addWidget(progress);
  return progress;
}

function createConsole(rootLayout) {
  const widget = createWidget(rootLayout);
  widget.setInlineStyle(`
    ${defaultWidgetStyle}
    flex: 1;
  `);
  const layout = createLayout(widget);

  const input = new QPlainTextEdit();
  input.setReadOnly(true);
  input.setInlineStyle(`
    flex: 1;
  `);

  layout.addWidget(input);
  return input;
}

function createDownloadButton(
  rootLayout,
  labelText,
  { link, directory, user, password, progress },
  log
) {
  const widget = createWidget(rootLayout);
  const layout = createLayout(widget);

  const button = new QPushButton();
  button.setText(labelText);
  button.setInlineStyle(`
    flex: 1;
    background: green;
  `);
  button.addEventListener("clicked", () => {
    // TODO Keep cursor down
    button.setEnabled(false);
    const child = child_process.fork(
      "./build/index.js",
      [
        `--url=${link.text()}`,
        `--login=${user.text()}`,
        `--password=${password.text()}`,
        `--target=${directory.text()}`,
      ],
      {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      }
    );

    child.stdout.on("data", (data) => {
      log.insertPlainText(data);
    });
    child.stderr.on("data", (data) => {
      log.insertPlainText(data);
    });

    child.on("message", (message) => {
      if (message.maximum) {
        progress.setMaximum(message.maximum);
      }
      if (message.progress) {
        progress.setValue(message.progress);
      }
    });

    child.on("exit", () => {
      button.setEnabled(true);
    });
  });

  layout.addWidget(button);
  return button;
}

function main() {
  const { win, rootLayout } = createWindow();
  const link = createInput(rootLayout, "Ebook link:");
  const directory = createDirectoryInput(rootLayout, "Target folder:");
  const user = createInput(rootLayout, "User:");
  const password = createInput(rootLayout, "Password:");
  password.setEchoMode(EchoMode.Password);
  const progress = createProgressBar(rootLayout);
  // TODO Add progress bar (use process.send and child.on("message"))
  // TODO Bundle puppeteer ?
  const log = createConsole(rootLayout);
  const downloadButton = createDownloadButton(
    rootLayout,
    "Download",
    { link, directory, user, password, progress },
    log
  );
  win.show();
  global.win = win;
}

main();
