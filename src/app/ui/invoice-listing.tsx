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
// import { xmlToJson, parseXML } from "../lib/actions";
import xml2js from "xml2js";

export function InvoiceListing() {
  const [fileMetadata, setFiles] = useState<File[] | null>(null);

  const handleLoadDir = async (): Promise<void> => {
    const result: CustoFileMetadata =
      await window.electronAPI.selectDirectory();

    if (result.success) {
      const files: File[] = await Promise.all(
        result.files.map(async (file): Promise<File> => {
          try {
            const parser = new xml2js.Parser({ attrkey: "attributes" });
            const content = file.contents
              ? await parser.parseStringPromise(file.contents)
              : null;

            return {
              fullPath: file.fullpath,
              name: file.name,
              contents: content,
            } as File;
          } catch (err) {
            console.error("Error parsing XML:", err);
            throw err;
          }
        }),
      );

      const onlyXMLfiles = files.filter(
        (metadata: File) => metadata.contents !== null,
      );

      const onlyPdffiles = files.filter(
        (metadata: File) => metadata.contents === null,
      );

      const pdfMap = new Map(
        onlyPdffiles.map((pdf) => [pdf.name, pdf.fullPath]),
      );

      const mergedFiles = onlyXMLfiles.map((xml) => {
        const baseName = xml.name;
        const pdfPath = pdfMap.get(baseName);

        return {
          ...xml,
          pdfPath, // will be undefined if no match
        };
      });

      console.log(mergedFiles);

      setFiles(mergedFiles);
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
          Array.from(fileMetadata).map((metadata: File, index) => (
            <li
              key={index}
              className="mt-5 flex flex-row place-content-between items-center"
            >
              <div>
                {metadata.contents?.["cfdi:Comprobante"].attributes.Serie}{" "}
                {metadata.contents?.["cfdi:Comprobante"].attributes.Folio}
              </div>
              <div>
                {
                  metadata.contents?.["cfdi:Comprobante"]["cfdi:Emisor"][0]
                    .attributes.Nombre
                }
              </div>
              {metadata.fullPath ? (
                <Button
                  onClick={() => handleOpenButton(metadata.fullPath!)}
                  className="bg-white hover:bg-gray-200 disabled:hover:bg-gray-50 md:hover:bg-gray-200"
                >
                  <div className="dark:text-black">xml</div>
                </Button>
              ) : (
                <div></div>
              )}
              {metadata.pdfPath ? (
                <Button
                  onClick={() => handleOpenButton(metadata.pdfPath!)}
                  className="bg-white hover:bg-gray-200 disabled:hover:bg-gray-50 md:hover:bg-gray-200"
                >
                  <div className="dark:text-black">pdf</div>
                </Button>
              ) : (
                <div></div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
