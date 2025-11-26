import React from "react";
import TablaConfiguracion from "../features/configuraciones/TablaConfiguracion";
import TablaRangoCilindraje from "../features/configuraciones/TablaRangoCilindraje";

const Configuraciones: React.FC = () => {
  return (
    <main className="w-full p-4">

      {/* === TABS DAISYUI (Lift) === */}
      <div className="tabs tabs-lift tabs-lg w-full">

        {/* TAB 1 */}
        <input
          type="radio"
          name="tabs_config"
          className="tab text-primary font-semibold"
          aria-label="Configuración de Plazos"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-b-2xl">
          <TablaConfiguracion />
        </div>

        {/* TAB 2 */}
        <input
          type="radio"
          name="tabs_config"
          className="tab text-secondary font-semibold"
          aria-label="Rangos de Cilindraje"
        />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-b-2xl">
          <TablaRangoCilindraje />
        </div>

      </div>
    </main>
  );
};

export default Configuraciones;
