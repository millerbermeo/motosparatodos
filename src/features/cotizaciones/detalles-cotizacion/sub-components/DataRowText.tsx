import React from 'react'

// Para valores que no son dinero (p. ej., Sí/No)
const DataRowText: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between bg-[#3498DB]/70 text-white px-3 py-2 rounded-md">
    <span className="font-medium">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);
export default DataRowText