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
import xml2js from "xml2js";
import arrayToCsv from "@/app/utils";

export function InvoiceListing() {
  const [fileMetadata, setFiles] = useState<Invoice[] | null>(null);

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
              filePath: file.filePath,
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
        onlyPdffiles.map((pdf) => [pdf.name, pdf.filePath]),
      );

      const mergedFiles: Invoice[] = onlyXMLfiles.map((xml) => {
        const baseName = xml.name;
        const pdfPath = pdfMap.get(baseName);

        return {
          serie: xml.contents?.["cfdi:Comprobante"].attributes.Serie,
          folio: xml.contents?.["cfdi:Comprobante"].attributes.Folio,
          emisor:
            xml.contents?.["cfdi:Comprobante"]["cfdi:Emisor"][0].attributes
              .Nombre,
          date: xml.contents?.["cfdi:Comprobante"].attributes.Fecha,
          subtotal: xml.contents?.["cfdi:Comprobante"].attributes.SubTotal,
          iva: xml.contents?.["cfdi:Comprobante"]["cfdi:Conceptos"][0][
            "cfdi:Concepto"
          ][0]["cfdi:Impuestos"][0]["cfdi:Traslados"][0]["cfdi:Traslado"][0]
            .attributes.Importe,
          total: xml.contents?.["cfdi:Comprobante"].attributes.Total,
          fullpath: xml.filePath,
          pdfPath, // will be undefined if no match
          emisorRfc:
            xml.contents?.["cfdi:Comprobante"]["cfdi:Emisor"][0].attributes.Rfc,
        } as Invoice;
      });

      setFiles(mergedFiles);
    }
  };

  const handleOpenButton = async (fullPath: string): Promise<void> => {
    await window.electronAPI.openPath(fullPath);
  };

  const handleToCsvButton = async (fileMetadata: Invoice[]) => {
    const csvData: string[][] = fileMetadata.map((invoice) => [
      invoice.date,
      "",
      (invoice.serie == undefined ? "" : invoice.serie) + " " + invoice.folio,
      invoice.emisorRfc,
      invoice.emisor,
      invoice.subtotal,
      invoice.iva.toString(),
      invoice.total,
    ]);

    const headers: string[] = [
      "Emisión",
      "",
      "Folio",
      "RFC",
      "Emisor",
      "Subtotal",
      "Iva",
      "Total",
    ];

    csvData.unshift(headers);

    try {
      const result = await window.electronAPI.saveFile([
        {
          name: "exported_csv",
          ext: ".csv",
          contents: arrayToCsv(csvData),
        },
      ]);

      if (result.success) {
        window.alert("Se ha exportado correctamente.");
      } else {
        window.alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.log(error);
    }
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
      {fileMetadata ? (
        <Button
          onClick={() => handleToCsvButton(fileMetadata!)}
          className="bg-white hover:bg-gray-200 md:hover:bg-gray-200"
        >
          <div className="dark:text-black">Export to CSV</div>
        </Button>
      ) : (
        <div></div>
      )}
      <br></br>
      <div className="flex flex-col gap-2.5">
        {fileMetadata &&
          Array.from(fileMetadata).map((metadata: Invoice, index) => (
            <details
              open={true}
              key={index}
              className="cursor-pointer rounded-2xl bg-gray-100 text-black select-none marker:text-transparent"
            >
              <summary className="h-full w-full p-6">
                {metadata.serie}
                {metadata.folio} <b>{metadata.emisor}</b>
              </summary>
              <div className="px-6 pb-6">
                <p>
                  <b>Fecha de generación: </b>
                  {metadata.date}
                </p>
                <p>
                  <b>RFC: </b>
                  {metadata.emisorRfc}
                </p>
                <p>
                  <b>Subtotal: </b>
                  {metadata.subtotal}
                </p>
                <p>
                  <b>Impuestos: </b>
                  {metadata.iva}
                </p>
                <p>
                  <b>Total: </b>
                  {metadata.total}
                </p>
                <div className="my-2 border border-t-gray-400"></div>
                <div className="flex flex-row gap-1">
                  {metadata.fullpath ? (
                    <Button
                      onClick={() => handleOpenButton(metadata.fullpath!)}
                      className="bg-orange-600 hover:bg-orange-700 disabled:hover:bg-gray-50"
                    >
                      <div className="dark:text-white">Show .xml</div>
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  {metadata.pdfPath ? (
                    <Button
                      onClick={() => handleOpenButton(metadata.pdfPath!)}
                      className="bg-orange-600 hover:bg-orange-700 disabled:hover:bg-gray-50"
                    >
                      <div className="dark:text-white">Show .pdf</div>
                    </Button>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </details>
          ))}
      </div>
    </div>
  );
}
