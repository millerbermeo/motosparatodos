// src/components/Loader.tsx
import React from 'react';
import { useLoaderStore } from '../store/loader.store';

const Loader: React.FC = () => {
  const isLoading = useLoaderStore((s) => s.isLoading);

  if (!isLoading) return null;

  return (
    <div className="bg-white/30 z-50 flex justify-center items-center w-full h-screen fixed inset-0">
      <div className="loader">
        <div className="cell d-0"></div>
        <div className="cell d-1"></div>
        <div className="cell d-2"></div>
        <div className="cell d-1"></div>
        <div className="cell d-2"></div>
        <div className="cell d-2"></div>
        <div className="cell d-3"></div>
        <div className="cell d-3"></div>
        <div className="cell d-4"></div>
      </div>
    </div>
  );
};

export default Loader;
