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

import { contextBridge, ipcRenderer } from "electron";

const electronAPI: ElectronAPI = {
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  openPath: (filePath) => ipcRenderer.send("open-file", filePath),
  showItemInFolder: (filePath) =>
    ipcRenderer.send("show-item-in-folder", filePath),
  saveFile: (files) => ipcRenderer.invoke("save-files-to-directory", files),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  getFileUrl: (absPath) => `file://${absPath.replace(/\\/g, "/")}`,
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
