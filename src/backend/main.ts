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

import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import serve from "electron-serve";
import path from "path";
import fs from "fs";

let mainWindow: BrowserWindow | null = null; // <‑‑ global reference

function toError(e: unknown): Error {
	return e instanceof Error ? e : new Error(String(e));
}

const appServe = app.isPackaged
	? serve({
		directory: path.join(__dirname, "../out"),
	})
	: null;

const createWindow = async (): Promise<void> => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			webviewTag: true,
		},
		icon: __dirname + "/icon.ico",
		titleBarStyle: "hidden",
		...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
	});

	if (app.isPackaged) {
		if (appServe != null) {
			await appServe(win);
			win.loadURL("app://-");
		}
	} else {
		win.loadURL("http://localhost:3000");
		win.webContents.openDevTools();
		win.webContents.on("did-fail-load", () => {
			win.webContents.reloadIgnoringCache();
		});
	}

	mainWindow = win;

	win.on("closed", () => {
		mainWindow = null;
	});
};

app.on("ready", () => {
	createWindow();
});

ipcMain.handle("select-directory", async (): Promise<SelectDirectoryResult> => {
	const result = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});

	if (result.canceled) {
		return { success: false, error: "User canceled" };
	}

	const dirPath = result.filePaths[0];

	try {
		const dirents = fs.readdirSync(dirPath, {
			recursive: true,
			withFileTypes: true,
		});

		const fileObjects: FileObject[] = [];

		for (const entry of dirents) {
			if (!entry.isFile()) continue;

			const filePath = path.join(entry.parentPath, entry.name);
			const ext: string = path.extname(filePath).toLowerCase();

			const acceptedTypes = new Map<string, FileType>([
				['.xml', 'XML'],
				['.pdf', 'PDF'],
				['.jpeg', 'TICKET'],
				['.jpg', 'TICKET'],
			]);

			if (!acceptedTypes.has(ext)) continue;

			const baseObj: FileObject = {
				filePath,
				type: acceptedTypes.get(ext)!,
				name: path.parse(filePath).name,
			};

			if (baseObj.type === 'XML') {
				try {
					baseObj.contents = fs.readFileSync(filePath, "utf-8");
				} catch (readErr) {
					const err = toError(readErr);
					console.error(
						`Could not read XML file "${filePath}": ${err.message}`,
					);
				}
			}

			fileObjects.push(baseObj);
		}

		return { success: true, files: fileObjects };
	} catch (outerErr) {
		const err = toError(outerErr);
		console.error("Directory processing error:", err.message);
		return { success: false, error: err.message };
	}
});

ipcMain.handle(
	"save-files-to-directory",
	async (
		_,
		files: Array<{ name: string; ext?: string; contents?: string }>,
	) => {
		try {
			// Show dialog to select a directory
			const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
				properties: ["openDirectory"],
				title: "Select Directory to Save Files",
			});

			if (canceled || !filePaths.length) {
				return { success: false, error: "No directory selected" };
			}

			const targetDir = filePaths[0];
			const savedFiles: Array<{ fullPath: string; name: string }> = [];
			const skippedFiles: Array<{
				name: string;
				fullPath: string;
				reason: string;
			}> = [];

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
					const response = await dialog.showMessageBox(mainWindow!, {
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
					const contentToWrite = isCsv
						? "\uFEFF" + file.contents
						: file.contents;
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
		} catch (outerErr) {
			const err = toError(outerErr);
			console.error("Error saving files:", err.message);
			return { success: false, error: err.message };
		}
	},
);

ipcMain.on("open-file", (_, filePath: string) => {
	shell.openPath(filePath);
});

ipcMain.on("show-item-in-folder", (_, filePath: string) => {
	shell.showItemInFolder(filePath);
});

ipcMain.handle("read-file", async (_, filePath: string) => {
	try {
		const isPdf = filePath.toLowerCase().endsWith(".pdf");
		const data = fs.readFileSync(filePath, isPdf ? null : "utf8");
		return { success: true, content: data, isPdf };
	} catch (readErr) {
		const err = toError(readErr);
		return { success: false, error: err.message };
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
