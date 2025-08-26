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

import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { Button } from "@/app/ui/button";
import format from "xml-formatter";

export default function ButtonExportPDF({
  invoices,
  outputPath,
}: {
  invoices: Invoice[];
  outputPath: string;
}) {
  async function mergeInvoiceFiles(invoices: Invoice[], outputPath: string) {
    // Create a new PDF document to hold everything
    const mergedPdf = await PDFDocument.create();

    for (const invoice of invoices) {
      // 1. If a PDF exists, merge it
      if (invoice.pdfPath) {
        const pdfBytes = await window.electronAPI.readFile(invoice.pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes.content);
        const copiedPages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices(),
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // 2. If an XML exists, embed it as a page with text
      if (invoice.fullpath) {
        const pageWidth = 612; // US Letter width
        const pageHeight = 792;
        const margin = 40;
        const fontSize = 12;

        const font = await mergedPdf.embedFont(StandardFonts.Courier);
        const result = await window.electronAPI.readFile(invoice.fullpath);
        const xmlContent = result.content;

        // Ensure we have a string
        let xmlString: string;
        if (typeof xmlContent === "string") {
          xmlString = xmlContent;
        } else {
          xmlString = Buffer.from(xmlContent).toString("utf8");
        }

        // Pretty format the XML
        const prettyXml = format(xmlString, {
          indentation: "  ",
          collapseContent: false,
        });

        const rawLines = prettyXml.split(/\r?\n/);

        // Hard wrap function: splits lines even without spaces
        const wrapLineHard = (text: string) => {
          const lines: string[] = [];
          let currentLine = "";
          for (const char of text) {
            const testLine = currentLine + char;
            if (
              font.widthOfTextAtSize(testLine, fontSize) >
              pageWidth - 2 * margin
            ) {
              lines.push(currentLine);
              currentLine = char;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          return lines;
        };

        let y = pageHeight - margin;
        let page = mergedPdf.addPage([pageWidth, pageHeight]);

        for (const rawLine of rawLines) {
          const wrappedLines = wrapLineHard(rawLine);

          for (const line of wrappedLines) {
            if (y < margin) {
              page = mergedPdf.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }

            page.drawText(line, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });

            y -= fontSize + 2; // line spacing
          }
        }
      }
    }

    // Save the merged PDF
    const mergedBytes = await mergedPdf.save();

    const result = await window.electronAPI.saveFile([
      {
        name: "exported",
        ext: ".pdf",
        contents: mergedBytes,
      },
    ]);

    if (result.success) {
      await window.electronAPI.showItemInFolder(result.files[0].fullPath);
    }
  }
  return (
    <Button
      onClick={() => mergeInvoiceFiles(invoices, outputPath)}
      className="rounded-r-lg bg-white hover:bg-gray-200 md:hover:bg-gray-200"
    >
      <div className="dark:text-black">Export to Merged PDF</div>
    </Button>
  );
}
