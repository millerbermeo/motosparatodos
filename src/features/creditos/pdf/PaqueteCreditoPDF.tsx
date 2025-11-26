import React from "react";
import { Document } from "@react-pdf/renderer";

// importa todas las páginas
import { Pagina1 } from "./pages/Pagina1";
import { Pagina2 } from "./pages/Pagina2";
import { Pagina3 } from "./pages/Pagina3";
import { Pagina4 } from "./pages/Pagina4";
import { Pagina5 } from "./pages/Pagina5";
import { Pagina6 } from "./pages/Pagina6";
import { Pagina7 } from "./pages/Pagina7";
import { Pagina8 } from "./pages/Pagina8";
import { Pagina9 } from "./pages/Pagina9";
import { Pagina10 } from "./pages/Pagina10";
import { Pagina11 } from "./pages/Pagina11";
import { Pagina12 } from "./pages/Pagina12";
import { Pagina13 } from "./pages/Pagina13";
import { Pagina14 } from "./pages/Pagina14";
import { Pagina15 } from "./pages/Pagina15";
import { Pagina16 } from "./pages/Pagina16";
import { Pagina17 } from "./pages/Pagina17";
import { Pagina18 } from "./pages/Pagina18";
import { Pagina19 } from "./pages/Pagina19";
import { Pagina20 } from "./pages/Pagina20";
import { Pagina21 } from "./pages/Pagina21";
import { Pagina22 } from "./pages/Pagina22";
import { Pagina23 } from "./pages/Pagina23";
import { Pagina24 } from "./pages/Pagina24";
import { Pagina25 } from "./pages/Pagina25";

// 🔴 para no pelearnos con TypeScript por ahora
type PaginaComponent = React.FC<any>;

const paginas: PaginaComponent[] = [
  Pagina1 as PaginaComponent,
  Pagina2 as PaginaComponent,
  Pagina3 as PaginaComponent,
  Pagina4 as PaginaComponent,
  Pagina5 as PaginaComponent,
  Pagina6 as PaginaComponent,
  Pagina7 as PaginaComponent,
  Pagina8 as PaginaComponent,
  Pagina9 as PaginaComponent,
  Pagina10 as PaginaComponent,
  Pagina11 as PaginaComponent,
  Pagina12 as PaginaComponent,
  Pagina13 as PaginaComponent,
  Pagina14 as PaginaComponent,
  Pagina15 as PaginaComponent,
  Pagina16 as PaginaComponent,
  Pagina17 as PaginaComponent,
  Pagina18 as PaginaComponent,
  Pagina19 as PaginaComponent,
  Pagina20 as PaginaComponent,
  Pagina21 as PaginaComponent,
  Pagina22 as PaginaComponent,
  Pagina23 as PaginaComponent,
  Pagina24 as PaginaComponent,
  Pagina25 as PaginaComponent,
];

export interface PaqueteCreditoPDFDocProps {
  data: any; // luego lo tipeamos bonito, por ahora “mientras”
}

export const PaqueteCreditoPDFDoc: React.FC<PaqueteCreditoPDFDocProps> = ({
  data,
}) => {

    console.log("Generando PDF con data:", data);
  return (
    <Document>
      {paginas.map((Pagina, index) => (
        <Pagina key={index} {...data} />
      ))}
    </Document>
  );
};
