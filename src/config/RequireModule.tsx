// routes/RequireModule.tsx
import React from "react";
import PrivateRoute from "./PrivateRoute";

const RequireModule: React.FC<{ name: string }> = ({ name }) => {
  return <PrivateRoute requireModule={name} />;
};

export default RequireModule;
