import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Tendencia from "./pages/Tendencia";
import Kmeans from "./pages/Kmeans";
import WebScraping from "./pages/WebScraping";
import MapaRiesgo from "./pages/MapaRiesgo";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/tendencia" element={<Tendencia />} />
            <Route path="/kmeans"    element={<Kmeans />} />
            <Route path="/scraping" element={<WebScraping />} />
            <Route path="/mapa" element={<MapaRiesgo />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
