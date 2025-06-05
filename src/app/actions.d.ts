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

interface File {
  fullPath: string;
  name: string;
  contents: {
    "cfdi:Comprobante": {
      attributes: {
        Serie: string;
        Folio: string;
        Fecha: string;
        SubTotal: string;
        Total: string;
      };
      "cfdi:Emisor": [
        {
          attributes: {
            Nombre: "fdf";
            Rfc: "dcffdff";
          };
        },
      ];
      "cfdi:Conceptos": [
        {
          "cfdi:Concepto": [
            {
              "cfdi:Impuestos": [
                {
                  "cfdi:Traslados": [
                    {
                      "cfdi:Traslado": [
                        {
                          attributes: {
                            Importe: number;
                          };
                        },
                      ];
                    },
                  ];
                },
              ];
            },
          ];
        },
      ];
    };
  } | null;
  pdfPath?: string;
}

interface Invoice {
  serie: string;
  folio: string;
  emisor: string;
  date: string;
  subtotal: string;
  iva: number;
  total: string;
  fullpath: string;
  pdfPath: string | undefined; // will be undefined if no match
}

interface CustoFileMetadata {
  success: boolean;
  files: Array<{
    fullpath: string;
    name: string;
    contents: string;
  }>;
}

interface Window {
  electronAPI: {
    selectDirectory: () => Promise<CustoFileMetadata>;
    openPath: (string) => Promise<string>;
  };
  void;
}

interface FileSystemDirectoryHandle {
  entries?: () => AsyncIterableIterator<[string, FileSystemHandle]>;
}
