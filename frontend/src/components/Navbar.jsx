import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo"></span>
        <span className="navbar-title">Inseguridad en México 2020–2025</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/"          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
        <NavLink to="/tendencia" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Tendencias</NavLink>
        <NavLink to="/kmeans"    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Zonas de Riesgo</NavLink>
        <NavLink to="/scraping" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Web Scraping</NavLink>
        <NavLink to="/mapa" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Mapa de Riesgo</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
