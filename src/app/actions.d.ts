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
  filePath: string | undefined;
  name: string | undefined;
  contents: {
    "cfdi:Comprobante": {
      attributes: {
        Serie: string | undefined;
        Folio: string | undefined;
        Fecha: string | undefined;
        SubTotal: string | undefined;
        Total: string | undefined;
      };
      "cfdi:Emisor":
        | [
            {
              attributes: {
                Nombre: string | undefined;
                Rfc: string | undefined;
              };
            },
          ]
        | undefined;
      "cfdi:Conceptos":
        | [
            {
              "cfdi:Concepto":
                | [
                    {
                      "cfdi:Impuestos":
                        | [
                            {
                              "cfdi:Traslados":
                                | [
                                    {
                                      "cfdi:Traslado":
                                        | [
                                            {
                                              attributes: {
                                                Importe: number | undefined;
                                              };
                                            },
                                          ]
                                        | undefined;
                                    },
                                  ]
                                | undefined;
                            },
                          ]
                        | undefined;
                    },
                  ]
                | undefined;
            },
          ]
        | undefined;
      "cfdi:Addenda":
        | [
            {
              "addendaFacto:addendaFacto":
                | [
                    {
                      "addendaFacto:notas": string | undefined;
                    },
                  ]
                | undefined;
            },
          ]
        | undefined;
    };
  } | null;
  pdfPath?: string;
}

interface Invoice {
  serie: string | undefined;
  folio: string | undefined;
  emisor: string | undefined;
  emisorRfc: string | undefined;
  date: string | undefined;
  subtotal: string | undefined;
  iva: number | undefined;
  total: string | undefined;
  fullpath: string | undefined;
  pdfPath: string | undefined; // will be undefined if no match
  notes: string | undefined;
}

interface CustoFileMetadata {
  success: boolean;
  files: Array<{
    filePath: string;
    name: string;
    contents: string;
  }>;
}

interface Window {
  electronAPI: {
    selectDirectory: () => Promise<CustoFileMetadata>;
    openPath: (string) => Promise<string>;
    showItemInFolder: (string) => Promise<string>;
    saveFile: (
      any,
    ) => Promise<{
      success;
      files: { fullPath: string; name: string }[];
      error;
    }>;
    readFile: (filePath: string) => Promise<{ success: boolean; content }>;
  };
  void;
}

interface FileSystemDirectoryHandle {
  entries?: () => AsyncIterableIterator<[string, FileSystemHandle]>;
}
