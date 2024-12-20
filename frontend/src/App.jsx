import React from "react";
import AppRouter from "./routes/AppRouter";
import "./styles/global.css"; // Manteniendo tus estilos globales

const App = () => {
  return (
    <div>
      {/* Renderiza el enrutador principal */}
      <AppRouter />
    </div>
  );
};

export default App;
