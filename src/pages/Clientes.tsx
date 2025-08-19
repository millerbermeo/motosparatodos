import { UserCircle } from 'lucide-react';
import React from 'react';

interface Cliente {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
}

const clientes: Cliente[] = [
  {
    nombre: 'Juan Pérez',
    correo: 'juanperez@example.com',
    telefono: '3123456789',
    direccion: 'Bogotá, Cra 10 # 12-34',
  },
  {
    nombre: 'Ana Gómez',
    correo: 'anagomez@example.com',
    telefono: '3001234567',
    direccion: 'Medellín, Av. Siempre Viva 742',
  },
  {
    nombre: 'Carlos Ramírez',
    correo: 'carlosr@example.com',
    telefono: '3105555555',
    direccion: 'Cali, Calle 8 # 45-21',
  },
  {
    nombre: 'Laura Torres',
    correo: 'lauratorres@example.com',
    telefono: '3113334444',
    direccion: 'Barranquilla, Cl. 72 # 45',
  },
  {
    nombre: 'Pedro Rojas',
    correo: 'pedror@example.com',
    telefono: '3156667777',
    direccion: 'Cartagena, Boca Grande',
  },
  {
    nombre: 'María Fernanda',
    correo: 'mariaf@example.com',
    telefono: '3168889999',
    direccion: 'Manizales, Sector Chipre',
  },
  {
    nombre: 'José Martínez',
    correo: 'josem@example.com',
    telefono: '3132221111',
    direccion: 'Bucaramanga, Cañaveral',
  },
  {
    nombre: 'Sandra Velásquez',
    correo: 'sandrav@example.com',
    telefono: '3144448888',
    direccion: 'Neiva, Av. La Toma',
  },
  {
    nombre: 'Diego León',
    correo: 'diegoleon@example.com',
    telefono: '3172223333',
    direccion: 'Ibagué, Centro',
  },
  {
    nombre: 'Camila Herrera',
    correo: 'camilah@example.com',
    telefono: '3181234567',
    direccion: 'Pasto, Nariño Plaza',
  },
];

const Clientes: React.FC = () => {
  return (
    <main className="w-full">
      {/* Sección HERO */}
      <section className="relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="badge badge-outline border-white/70 text-white/80 mb-3">
                Módulo en desarrollo
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Gestión de Clientes
              </h1>
              <p className="mt-2 text-white/90 max-w-2xl">
                Próximamente podrás gestionar y contactar a tus clientes desde esta sección.
              </p>
            </div>
            <div className="stats shadow bg-white/10 backdrop-blur-sm text-white">
              <div className="stat">
                <div className="stat-title text-white/80">Estado</div>
                <div className="stat-value text-white">En desarrollo</div>
                <div className="stat-desc text-white/80">
                  Funcionalidades activas pronto
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-14 top-6 rotate-45 bg-black/20 px-16 py-2 text-sm font-semibold tracking-widest select-none pointer-events-none">
            EN DESARROLLO
          </div>
        </div>
      </section>

      {/* Lista de clientes */}
      <section className="bg-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Clientes Registrados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {clientes.map((cliente, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 flex flex-col items-center text-center"
              >
                <UserCircle className="text-6xl text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">{cliente.nombre}</h3>
                <p className="text-gray-500 text-sm mt-1">{cliente.correo}</p>
                <p className="text-gray-500 text-sm">{cliente.telefono}</p>
                <p className="text-gray-500 text-sm">{cliente.direccion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Clientes;
