// Copyright (C) 2025 theRightHoopRod
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const fs = require("fs");

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "../out"),
    })
  : null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

app.on("ready", () => {
  createWindow();
});

ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) return { success: false, error: "User canceled" };

  const dirPath = result.filePaths[0];
  try {
    const filePaths = fs.readdirSync(dirPath);
    const files = filePaths.map((filePath) => {
      let fullpath = path.join(dirPath, filePath);
      let pathMetadata = path.parse(filePath);

      if (pathMetadata.ext == ".xml") {
        const contents = fs.readFileSync(fullpath, "utf-8");

        return {
          fullpath: fullpath,
          name: pathMetadata.name,
          contents: contents,
        };
      }

      return {
        fullpath: fullpath,
        name: pathMetadata.name,
      };
    });
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.on("open-file", (event, filePath) => {
  shell.openPath(filePath);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
