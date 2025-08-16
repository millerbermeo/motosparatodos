import React from 'react'
import TablaMarcas from '../features/vehiculos/TablaMarcas'
import TablaLineasMarcas from '../features/vehiculos/TablaLineasMarcas'
import TablaMotos from '../features/vehiculos/TablaMotos'

const Motocicletas: React.FC = () => {
    return (

        <>
            {/* name of each tab group should be unique */}
            <div className="tabs tabs-lift">
                <input type="radio" name="my_tabs_3" className="tab" aria-label="Moticletas" />
                <div className="tab-content bg-base-100 border-base-300 p-6">
                    <TablaMotos />
                </div>

                <input type="radio" name="my_tabs_3" className="tab" aria-label="Marcas" defaultChecked />
                <div className="tab-content bg-base-100 border-base-300 p-6">
                    <TablaMarcas />
                </div>

                <input type="radio" name="my_tabs_3" className="tab" aria-label="Lineas" />
                <div className="tab-content bg-base-100 border-base-300 p-6">
                    <TablaLineasMarcas />
                </div>
            </div>
        </>
    )
}

export default Motocicletas