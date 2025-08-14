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
    icon: __dirname + "/icon.ico",
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
    // Read directory recursively and filter for files only
    const filePaths = fs
      .readdirSync(dirPath, { recursive: true, withFileTypes: true })
      .filter((item) => item.isFile())
      .map((item) => (item.path ? path.join(item.path, item.name) : item.name)); // Handle recursive path

    const files = filePaths
      .map((filePath) => {
        const pathMetadata = path.parse(filePath);

        // Check for supported file extensions
        if ([".xml", ".pdf"].includes(pathMetadata.ext.toLowerCase())) {
          const fileObject = {
            filePath,
            name: pathMetadata.name,
          };

          // Read contents only for XML files
          if (pathMetadata.ext.toLowerCase() === ".xml") {
            try {
              fileObject.contents = fs.readFileSync(filePath, "utf-8");
            } catch (readError) {
              console.error(
                `Error reading file ${filePath}:`,
                readError.message,
              );
              return null;
            }
          }

          return fileObject;
        }
        return null;
      })
      .filter(Boolean); // Remove null/undefined values

    return {
      success: true,
      files,
    };
  } catch (error) {
    console.error("Directory processing error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle("save-files-to-directory", async (event, files) => {
  let mainWindow = null; // Assume mainWindow is passed or accessible
  try {
    // Show dialog to select a directory
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select Directory to Save Files",
    });

    if (canceled || !filePaths.length) {
      return { success: false, error: "No directory selected" };
    }

    const targetDir = filePaths[0];
    const savedFiles = [];
    const skippedFiles = [];

    // Process each file
    for (const file of files) {
      const fileExtension =
        file.ext ||
        (file.contents && file.contents.includes(",") ? ".csv" : ".xml");
      const filePath = path.join(targetDir, `${file.name}${fileExtension}`);
      const dirPath = path.dirname(filePath);

      // Ensure the directory exists (recursive creation)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        const response = await dialog.showMessageBox(mainWindow, {
          type: "question",
          buttons: ["Replace", "Skip"],
          defaultId: 1, // Default to "Skip"
          title: "File Already Exists",
          message: `The file "${file.name}${fileExtension}" already exists in the selected directory.`,
          detail: "Do you want to replace it or skip saving this file?",
        });

        // If user chooses "Skip" (response 1), skip this file
        if (response.response === 1) {
          skippedFiles.push({
            name: file.name,
            fullPath: filePath,
            reason: "Skipped due to existing file",
          });
          continue;
        }
      }

      // Write file content
      if (file.contents) {
        // Add UTF-8 BOM for CSV files
        const isCsv = fileExtension.toLowerCase() === ".csv";
        const contentToWrite = isCsv ? "\uFEFF" + file.contents : file.contents;
        fs.writeFileSync(filePath, contentToWrite, { encoding: "utf8" });
      } else {
        // For non-text files (e.g., PDF), write placeholder or copy content
        fs.writeFileSync(filePath, "");
      }

      savedFiles.push({
        fullPath: filePath,
        name: file.name,
      });
    }

    return {
      success: true,
      files: savedFiles,
      skippedFiles: skippedFiles.length > 0 ? skippedFiles : undefined,
    };
  } catch (error) {
    console.error("Error saving files:", error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.on("open-file", (event, filePath) => {
  shell.openPath(filePath);
});

ipcMain.on("show-item-in-folder", (event, filePath) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle("read-file", async (event, filePath) => {
  try {
    const isPdf = filePath.toLowerCase().endsWith(".pdf");
    const data = fs.readFileSync(filePath, isPdf ? null : "utf8");
    return { success: true, content: data, isPdf };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
