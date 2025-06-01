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

"use client";

import React, { useState } from "react";
import { Button } from "@/app/ui/button";
import path from "path";

export function InvoiceListing() {
  const [fileMetadata, setFiles] = useState<FileMetadata[] | null>(null);

  const handleLoadDir = async (): Promise<void> => {
    const result = await window.electronAPI.selectDirectory();

    if (result.success) {
      const arrayFullPath: FileMetadata[] = (result.files as Array<string>).map(
        (file: string) => {
          return {
            name: path.parse(file).name,
            fullPath: path.join(result.dirPath, file),
          };
        },
      );

      setFiles(arrayFullPath);
    }
  };

  const handleOpenButton = async (fullPath: string): Promise<void> => {
    await window.electronAPI.openPath(fullPath);
  };

  return (
    <div className="w-full px-5">
      <Button
        onClick={() => handleLoadDir()}
        className="bg-white hover:bg-gray-200 md:hover:bg-gray-200"
      >
        <div className="dark:text-black">Select directory</div>
      </Button>
      <br></br>
      <ul>
        {fileMetadata &&
          Array.from(fileMetadata).map((metadata: FileMetadata, index) => (
            <li
              key={index}
              className="mt-5 flex flex-row place-content-between items-center"
            >
              {metadata.name}
              <Button
                onClick={() => handleOpenButton(metadata.fullPath)}
                className="bg-white visited:bg-red-600 hover:bg-gray-200 md:hover:bg-gray-200"
              >
                <div className="dark:text-black">Open file</div>
              </Button>
            </li>
          ))}
      </ul>
    </div>
  );
}
