//Router:	Envuelve la aplicación y gestiona la navegación.
//Routes:	Agrupa múltiples rutas y muestra solo la primera coincidencia.
//Route:	Define una URL específica y qué componente renderizar.

//Instala lo siguiente
//npm install sockjs-client stompjs


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./pages/Navbar/Navbar";
import Home from "./pages/mainPages/Home";
import Dashbord from "./pages/mainPages/Dashbord";
import Default from "./pages/mainPages/Default";
import Developer from "./pages/mainPages/Developer";


function App() {
  return (
    <Router>
      <div className="app">
        {/* Barra de navegación */}
        <Navbar />
        {/* Contenido de la página */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/developer" element={<Developer />} />
            <Route path="/dashbord" element={<Dashbord />} />
            <Route path="*" element={<Default />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
