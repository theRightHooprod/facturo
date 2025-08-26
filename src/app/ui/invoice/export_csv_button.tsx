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

import { Button } from "@/app/ui/button";
import { arrayToCsv, formatDateTimeForExcel } from "@/app/utils";

export default function ButtonExportCSV({ invoices }: { invoices: Invoice[] }) {
  const handleToCsvButton = async (fileMetadata: Invoice[]) => {
    const csvData: string[][] = fileMetadata.map((invoice) => [
      typeof invoice.date === "string"
        ? formatDateTimeForExcel(invoice.date)
        : "",
      "",
      `${invoice.serie ?? ""} ${invoice.folio}`,
      invoice.emisorRfc ?? "",
      invoice.emisor ?? "",
      invoice.subtotal ?? "",
      invoice.iva?.toString() ?? "",
      invoice.total ?? "",
    ]);

    const headers: string[] = [
      "Emisión",
      "Concepto",
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
          name: "exported",
          ext: ".csv",
          contents: "\uFEFF" + arrayToCsv(csvData),
        },
      ]);

      if (result.success) {
        await window.electronAPI.showItemInFolder(result.files[0].fullPath);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      onClick={() => handleToCsvButton(invoices)}
      className="rounded-r-lg bg-white hover:bg-gray-200 md:hover:bg-gray-200"
    >
      <div className="dark:text-black">CSV</div>
    </Button>
  );
}
