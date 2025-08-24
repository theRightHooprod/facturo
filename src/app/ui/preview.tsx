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

export default function Preview() {
  return (
    <object
      data="https://www.panini.es/media/paniniFiles/Ndp-el-anime-de-mushoku-tensei-tendra-tercera-temporada.pdf"
      type="application/pdf"
      width="100%"
      height="100%"
    >
      <p>
        Alternative text - include a link{" "}
        <a href="http://africau.edu/images/default/sample.pdf">to the PDF!</a>
      </p>
    </object>
  );
}
