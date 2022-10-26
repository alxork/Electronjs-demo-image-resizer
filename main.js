// !DEFINE APP WINDOWS LAYOUT HERE
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
// ?----------------------------------------------------------------

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = (process.platform = 'darwin'); // true / false

let mainWindow; //?To have it accessible on a global scope.

// *Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 800,
    height: isDev ? 800 : 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  //   Open devtools if in dev mode environment.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// *Create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    width: 300,
    height: 300,
  });
  //   Open devtools if in dev mode environment.

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// *App is ready
app.whenReady().then(() => {
  createMainWindow();
  // *implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // *remove main window from memory on close
  mainWindow.on('close', () => (mainWindow = null));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// *Menu template
const menu = [
  // Todo esto de abajo se puede abreviar así: {role:'fileMenu}
  {
    label: 'Arxiu',
    submenu: [
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                {
                  label: 'About',
                  click: createAboutWindow,
                },
              ],
            },
          ]
        : []),
      {
        role: 'fileMenu',
      },
      ...(!isMac
        ? [{ label: 'Ajuda', submenu: [{ label: 'About', click: createAboutWindow }] }]
        : []),
    ],
  },
];

// *Resize the imageç
const resizeImage = async ({ imagePath, width, height, dest }) => {
  try {
    const newPath = await resizeImg(fs.readFileSync(imagePath), {
      width: +width,
      height: +height,
    });
    // Create filename
    const filename = path.basename(imagePath);

    // Create destination folder
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Write file to destination folder created
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send success message back to the renderer.js
    mainWindow.webContents.send('image:done');

    // Open the destination folder automatically
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
};

// *Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'documents/App_Dev/electronjs/redimens');
  resizeImage(options);
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
