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

interface SaveFile {
  name: string;
  ext?: string;
  contents?: string;
}

interface ElectronAPI {
  on(
    channel: string,
    callback: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ): void;

  /**
   * Send a fire‑and‑forget message to the main process.
   *
   * @param channel   The channel name
   * @param args      Payload (any serialisable value)
   */
  send(channel: string, args?: unknown): void;

  /** Open the native “select folder” dialog (returns a promise). */
  selectDirectory(): Promise<{
    success: boolean;
    error?: string;
    files?: unknown[];
  }>;

  /** Ask the main process to open a file with the default OS handler. */
  openPath(filePath: string): void;

  /** Reveal a file/folder in the OS file manager. */
  showItemInFolder(filePath: string): void;

  /** Save an array of `SaveFile` objects to a user‑chosen directory. */
  saveFile(files: SaveFile[]): Promise<{
    success: boolean;
    error?: string;
    files?: { fullPath: string; name: string }[];
    skippedFiles?: { name: string; fullPath: string; reason: string }[];
  }>;

  /** Read a file (binary or text) and get its contents back. */
  readFile(
    filePath: string,
  ): Promise<{
    success: boolean;
    content?: Buffer | string;
    isPdf?: boolean;
    error?: string;
  }>;
}

interface FileObject {
  filePath: string;
  name: string;
  /** Only filled for XML files */
  contents?: string;
}

interface SelectDirectoryResult {
  success: boolean;
  error?: string;
  files?: FileObject[];
}
