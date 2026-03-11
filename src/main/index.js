import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(app.getPath('userData'), 'clients.json');
const devicesPath = path.join(app.getPath('userData'), 'devices.json');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({

  width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]))
}

// read
ipcMain.handle('get-clients', () => {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
})

// add
ipcMain.handle('add-client', (event, newClient) => {
    const clients = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    clients.push(newClient)
    fs.writeFileSync(dataPath, JSON.stringify(clients))
})

// update
ipcMain.handle('update-client', (event, index, updatedClient) => {
    const clients = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    clients[index] = updatedClient
    fs.writeFileSync(dataPath, JSON.stringify(clients))
})

// delete
ipcMain.handle('delete-client', (event, index) => {
    const clients = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    clients.splice(index, 1)
    fs.writeFileSync(dataPath, JSON.stringify(clients))
})

if (!fs.existsSync(devicesPath)) {
    fs.writeFileSync(devicesPath, JSON.stringify([]))
}

ipcMain.handle('get-devices', () => {
    return JSON.parse(fs.readFileSync(devicesPath, 'utf-8'))
})

ipcMain.handle('add-device', (event, newDevice) => {
    const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'))
    devices.push(newDevice)
    fs.writeFileSync(devicesPath, JSON.stringify(devices))
})


ipcMain.handle('delete-device', (event, index) => {
    const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'))
    devices.splice(index, 1)
    fs.writeFileSync(devicesPath, JSON.stringify(devices))
})

ipcMain.handle('update-device', (event, index, updatedId) => {
    const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'))
    devices[index].id = updatedId
    fs.writeFileSync(devicesPath, JSON.stringify(devices))
})

ipcMain.handle('update-device-status', (event, id, status) => {
    const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'))
    const device = devices.find(d => d.id === id)
    if (device) device.status = status
    fs.writeFileSync(devicesPath, JSON.stringify(devices))
})
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// initialize file if it doesn't exist
