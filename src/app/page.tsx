"use client";

import React, { useState } from "react";
import { Button } from "@/app/ui/button";
import xml2js from "xml2js";
import InvoiceContainer from "@/app/ui/invoice/invoice-container";
import ButtonExportPDF from "@/app/ui/invoice/export_pdf_button";
import ButtonExportCSV from "@/app/ui/invoice/export_csv_button";

export default function Home() {
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
            xml.contents?.["cfdi:Comprobante"]["cfdi:Emisor"]?.[0].attributes
              .Nombre,
          date: xml.contents?.["cfdi:Comprobante"].attributes.Fecha,
          subtotal: xml.contents?.["cfdi:Comprobante"].attributes.SubTotal,
          iva: xml.contents?.["cfdi:Comprobante"]["cfdi:Conceptos"]?.[0][
            "cfdi:Concepto"
          ]?.[0]["cfdi:Impuestos"]?.[0]["cfdi:Traslados"]?.[0][
            "cfdi:Traslado"
          ]?.[0].attributes.Importe,
          total: xml.contents?.["cfdi:Comprobante"].attributes.Total,
          fullpath: xml.filePath,
          pdfPath, // will be undefined if no match
          emisorRfc:
            xml.contents?.["cfdi:Comprobante"]["cfdi:Emisor"]?.[0].attributes
              .Rfc,
          notes:
            xml.contents?.["cfdi:Comprobante"]["cfdi:Addenda"]?.[0][
              "addendaFacto:addendaFacto"
            ]?.[0]["addendaFacto:notas"],
        } as Invoice;
      });

      setFiles(mergedFiles);
    }
  };

  return (
    <div className="mt-15 flex flex-col items-center justify-center md:mt-8">
      <div className="h-5"></div>
      <div className="flex w-full flex-col gap-2.5 px-5">
        <div className="flex gap-2">
          <Button
            onClick={() => handleLoadDir()}
            className="bg-white hover:bg-gray-200 md:hover:bg-gray-200"
          >
            <div className="dark:text-black">
              {fileMetadata ? "Switch directory" : "Select directory"}
            </div>
          </Button>
          {fileMetadata && (
            <div className="flex gap-2">
              <ButtonExportCSV invoices={fileMetadata} />
              <ButtonExportPDF
                invoices={fileMetadata}
                outputPath="/downloads"
              />
            </div>
          )}
        </div>
        {fileMetadata && (
          <div className="flex gap-2.5">
            <p>
              <b>Loaded:</b> {fileMetadata.length}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {fileMetadata?.map((metadata: Invoice, index) => (
            <InvoiceContainer key={index} invoice={metadata} />
          ))}
        </div>
      </div>
    </div>
  );
}
