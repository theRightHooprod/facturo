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

import { Button } from "@/app/ui/button";
import { useActionState } from "react";
import { loadInvoices } from "../lib/actios";

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    loadInvoices,
    undefined
  );

  return (
    <form action={formAction}>
      <Button className="bg-white hover:bg-gray-200 md:hover:bg-gray-200">
        <div className="dark:text-black">Hello I'm a button </div>
      </Button>
    </form>
  );
}
