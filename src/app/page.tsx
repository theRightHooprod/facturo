"use client";

import React, { useState } from "react";
import { Button } from "@/app/ui/button";
import xml2js from "xml2js";
import InvoiceContainer from "@/app/ui/invoice/invoice-container";
import ButtonExportPDF from "@/app/ui/invoice/export_pdf_button";
import ButtonExportCSV from "@/app/ui/invoice/export_csv_button";
import Preview from "./ui/preview";

export default function Home() {
  const [fileMetadata, setFiles] = useState<Invoice[] | null>(null);
  const [previewMetadata, setPreviewMetadata] = useState<Invoice | null>(null);

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
    <div className="flex h-[calc(100vh-32px)] gap-2">
      <div className="flex flex-col gap-2.5">
        <Button
          onClick={() => handleLoadDir()}
          className="rounded-br-lg bg-white hover:bg-gray-200 md:hover:bg-gray-200"
        >
          <div className="dark:text-black">
            {fileMetadata ? "Switch directory" : "Select directory"}
          </div>
        </Button>
        {fileMetadata && <ButtonExportCSV invoices={fileMetadata} />}
        {fileMetadata && (
          <ButtonExportPDF invoices={fileMetadata} outputPath="/downloads" />
        )}
        {fileMetadata && (
          <div className="flex gap-2.5">
            <p>
              <b>Total:</b> <br />
              {fileMetadata.length}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-nowrap gap-2.5 overflow-x-auto">
        {fileMetadata?.map((metadata: Invoice, index) => (
          <InvoiceContainer
            onClick={() => setPreviewMetadata(metadata)}
            key={index}
            invoice={metadata}
          />
        ))}
      </div>
      {previewMetadata && <Preview invoice={previewMetadata} />}
    </div>
  );
}
