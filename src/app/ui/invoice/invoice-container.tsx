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
import { MouseEventHandler } from "react";

const handleOpenButton = async (fullPath: string): Promise<void> => {
  await window.electronAPI.openPath(fullPath);
};

const handleShowItemInFolderButton = async (
  fullPath: string,
): Promise<void> => {
  await window.electronAPI.showItemInFolder(fullPath);
};

export default function InvoiceContainer({
  invoice,
  onClick,
}: {
  invoice: Invoice;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <details
      open={true}
      className="cursor-pointer rounded-l-xl bg-gray-100 text-black select-none marker:text-transparent first:mt-2.5 last:mb-2.5"
    >
      <summary className="p-2">
        {invoice.serie}
        {invoice.folio} <b>{invoice.emisor}</b>
      </summary>
      <div className="px-2 pb-2">
        <p>
          <b>Fecha de generación: </b>
          {invoice.date ? new Date(invoice.date).toLocaleString("es-MX") : ""}
        </p>
        <p>
          <b>RFC: </b>
          {invoice.emisorRfc}
        </p>
        <p>
          <b>Subtotal: </b>
          {invoice.subtotal}
        </p>
        <p>
          <b>Impuestos: </b>
          {invoice.iva}
        </p>
        <p>
          <b>Total: </b>
          {invoice.total}
        </p>
        {invoice.notes ? (
          <p>
            <b>Notas: </b>
            {invoice.notes}
          </p>
        ) : (
          <div></div>
        )}
        <div className="my-2 border border-t-gray-400"></div>
        <div className="flex flex-row gap-1">
          {invoice.fullpath ? (
            <Button
              onClick={() => handleOpenButton(invoice.fullpath!)}
              className="bg-orange-600 hover:bg-orange-700 disabled:hover:bg-gray-50"
            >
              <div className="dark:text-white">Show .xml</div>
            </Button>
          ) : (
            <div></div>
          )}
          {invoice.pdfPath ? (
            <Button
              onClick={() => handleOpenButton(invoice.pdfPath!)}
              className="bg-orange-600 hover:bg-orange-700 disabled:hover:bg-gray-50"
            >
              <div className="dark:text-white">Show .pdf</div>
            </Button>
          ) : (
            <div></div>
          )}
          {invoice.pdfPath ? (
            <Button
              onClick={onClick}
              className="bg-orange-600 hover:bg-orange-700 disabled:hover:bg-gray-50"
            >
              <div className="dark:text-white">Open in file explorer</div>
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </details>
  );
}
