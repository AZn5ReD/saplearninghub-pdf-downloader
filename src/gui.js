import {
  QMainWindow,
  QWidget,
  QLabel,
  FlexLayout,
  QPushButton,
  QFileDialog,
  QLineEdit,
  QToolButton,
  QGroupBox,
  QBoxLayout,
  QIcon,
  EchoMode,
  FileMode,
  QPlainTextEdit,
} from "@nodegui/nodegui";

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
  const widget = new QWidget();
  widget.setInlineStyle(`
    padding: 5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  `);
  rootLayout.addWidget(widget);

  const layout = new FlexLayout();
  layout.setFlexNode(widget.getFlexNode());

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
  widget.setLayout(layout);
  return input;
}

function createDirectoryInput(rootLayout, labelText) {
  const widget = new QWidget();
  widget.setInlineStyle(`
    padding: 5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  `);
  rootLayout.addWidget(widget);

  const layout = new FlexLayout();
  layout.setFlexNode(widget.getFlexNode());

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
  widget.setLayout(layout);
  return input;
}

function createConsole(rootLayout) {
  const widget = new QWidget();
  widget.setInlineStyle(`
    padding: 5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex: 1;
  `);
  rootLayout.addWidget(widget);

  const layout = new FlexLayout();
  layout.setFlexNode(widget.getFlexNode());

  const input = new QPlainTextEdit();
  input.setReadOnly(true);
  input.setInlineStyle(`
    flex: 1;
  `);

  layout.addWidget(input);
  widget.setLayout(layout);
  return input;
}

function createDownloadButton(
  rootLayout,
  labelText,
  { link, directory, user, password },
  log
) {
  const widget = new QWidget();
  widget.setInlineStyle(`
    padding: 5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  `);
  rootLayout.addWidget(widget);

  const layout = new FlexLayout();
  layout.setFlexNode(widget.getFlexNode());

  const button = new QPushButton();
  button.setText(labelText);
  button.setInlineStyle(`
    flex: 1;
    background: green;
    color: white;
  `);
  button.addEventListener("clicked", () => {
    log.insertPlainText(link.text() + "\n");
    log.insertPlainText(directory.text() + "\n");
    log.insertPlainText(user.text() + "\n");
    log.insertPlainText(password.text() + "\n");
    console.log(link, directory, user, password);
  });

  layout.addWidget(button);
  widget.setLayout(layout);
  return button;
}

function main() {
  const { win, rootLayout } = createWindow();
  const link = createInput(rootLayout, "Ebook link:");
  const directory = createDirectoryInput(rootLayout, "Target folder:");
  const user = createInput(rootLayout, "User:");
  const password = createInput(rootLayout, "Password:");
  password.setEchoMode(EchoMode.Password);
  const log = createConsole(rootLayout);
  const downloadButton = createDownloadButton(
    rootLayout,
    "Download",
    { link, directory, user, password },
    log
  );
  win.show();
  global.win = win;
}

main();
