import React from 'react'
// import { useUsuarios } from '../../services/usersServices'
import FormularioUsuarios from './FormularioUsuarios'
import { useModalStore } from '../../store/modalStore';

const TablaUsuarios: React.FC = () => {

  // const {data, isPending, isError} = useUsuarios()

  // if (isPending) {
  //     return "cargando usuarios"
  // }

  // if (isError) {
  //     return "error al caragar usuarios"
  // }


  const open = useModalStore((s) => s.open);

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl">


      <div className="px-4 pt-4">

        <button
          className="btn btn-primary"
          onClick={() =>
            open(
              <FormularioUsuarios />,
              "Crear usuario",
              { size: "4xl", position: "center" } // 👈 controla tamaño/posición
            )
          }
        >
          Crear Usuario
        </button>

        <h3 className="text-sm font-semibold tracking-wide text-base-content/70 mt-5">
          Modulo de usuarios
        </h3>
      </div>

      <table className="table table-zebra table-pin-rows table-pin-cols">
        {/* Encabezado */}
        <thead className="sticky top-0 z-10 bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th className="w-12"></th>
            <th className="py-4">Name</th>
            <th className="py-4">Job</th>
            <th className="py-4">Favorite Color</th>
          </tr>
        </thead>

        {/* Cuerpo */}
        <tbody className="[&>tr:hover]:bg-base-200/40">
          {/* row 1 */}
          <tr className="transition-colors">
            <th className="text-base-content/50">1</th>
            <td>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
                    <img src="https://i.pravatar.cc/40?img=1" alt="Cy Ganderton" />
                  </div>
                </div>
                <div>
                  <div className="font-medium">Cy Ganderton</div>
                  <div className="text-xs text-base-content/50">ID: 001</div>
                </div>
              </div>
            </td>
            <td>
              <span className="badge badge-ghost badge-md">Quality Control Specialist</span>
            </td>
            <td>
              <span className="badge badge-primary badge-outline">Blue</span>
            </td>
          </tr>

          {/* row 2 */}
          <tr className="transition-colors">
            <th className="text-base-content/50">2</th>
            <td>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
                    <img src="https://i.pravatar.cc/40?img=2" alt="Hart Hagerty" />
                  </div>
                </div>
                <div>
                  <div className="font-medium">Hart Hagerty</div>
                  <div className="text-xs text-base-content/50">ID: 002</div>
                </div>
              </div>
            </td>
            <td>
              <span className="badge badge-ghost badge-md">Desktop Support Technician</span>
            </td>
            <td>
              <span className="badge badge-secondary badge-outline">Purple</span>
            </td>
          </tr>

          {/* row 3 */}
          <tr className="transition-colors">
            <th className="text-base-content/50">3</th>
            <td>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
                    <img src="https://i.pravatar.cc/40?img=3" alt="Brice Swyre" />
                  </div>
                </div>
                <div>
                  <div className="font-medium">Brice Swyre</div>
                  <div className="text-xs text-base-content/50">ID: 003</div>
                </div>
              </div>
            </td>
            <td>
              <span className="badge badge-ghost badge-md">Tax Accountant</span>
            </td>
            <td>
              <span className="badge badge-error badge-outline">Red</span>
            </td>
          </tr>
        </tbody>

        {/* Pie (refuerza columnas) */}
        <tfoot className="bg-base-200/60">
          <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider [&>th]:text-base-content/70">
            <th></th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
          </tr>
        </tfoot>
      </table>

      {/* Footer de tarjeta */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <span className="text-xs text-base-content/50">Mostrando 3 de 3</span>
        <div className="join">
          <button className="btn btn-xs join-item">«</button>
          <button className="btn btn-xs join-item btn-active">1</button>
          <button className="btn btn-xs join-item">2</button>
          <button className="btn btn-xs join-item">»</button>
        </div>
      </div>
    </div>


  )
}

export default TablaUsuarios