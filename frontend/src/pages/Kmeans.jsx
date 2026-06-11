import { useEffect, useState } from "react";
import { getKmeans } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const ZONAS = ["Todas", "Riesgo Alto", "Riesgo Medio", "Riesgo Bajo"];

const COLOR_ZONA = {
  "Riesgo Alto":  "#C0392B",
  "Riesgo Medio": "#E67E22",
  "Riesgo Bajo":  "#27AE60",
};

const BADGE_CLASS = {
  "Riesgo Alto":  "badge badge-alto",
  "Riesgo Medio": "badge badge-medio",
  "Riesgo Bajo":  "badge badge-bajo",
};

function Kmeans() {
  const [datos,   setDatos]   = useState([]);
  const [filtro,  setFiltro]  = useState("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKmeans().then(setDatos).finally(() => setLoading(false));
  }, []);

  const datosFiltrados = filtro === "Todas"
    ? datos
    : datos.filter((d) => d.Zona_Riesgo === filtro);

  // Conteo por zona para la gráfica
  const conteo = ["Riesgo Alto", "Riesgo Medio", "Riesgo Bajo"].map((zona) => ({
    zona,
    estados: datos.filter((d) => d.Zona_Riesgo === zona).length,
  }));

  if (loading) return <div className="loading">Cargando clasificación...</div>;

  return (
    <div>
      <h1 className="section-title">Zonas de Riesgo — K-Means</h1>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>

        {/* Gráfica de barras por zona */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Estados por zona de riesgo
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conteo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="zona" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="estados" radius={[6,6,0,0]} name="Estados">
                {conteo.map((entry) => (
                  <Cell key={entry.zona} fill={COLOR_ZONA[entry.zona]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica de barras — tasa homicidio por zona */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Tasa promedio de Homicidio por zona
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={["Riesgo Alto","Riesgo Medio","Riesgo Bajo"].map((zona) => {
                const est = datos.filter((d) => d.Zona_Riesgo === zona);
                const avg = est.length
                  ? (est.reduce((s,d) => s + d.Tasa_Homicidio, 0) / est.length).toFixed(2)
                  : 0;
                return { zona, promedio: parseFloat(avg) };
              })}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="zona" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="promedio" radius={[6,6,0,0]} name="Tasa Homicidio">
                {["Riesgo Alto","Riesgo Medio","Riesgo Bajo"].map((zona) => (
                  <Cell key={zona} fill={COLOR_ZONA[zona]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Filtro + Tabla */}
      <div className="card">
        <div className="filtros-row">
          <span className="filtros-label">Filtrar por zona:</span>
          {ZONAS.map((z) => (
            <button
              key={z}
              onClick={() => setFiltro(z)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: filtro === z ? "700" : "400",
                background: filtro === z
                  ? (COLOR_ZONA[z] || "#1F3864")
                  : "#f0f4f8",
                color: filtro === z ? "#fff" : "#555",
                fontSize: "0.85rem",
                transition: "all 0.2s",
              }}
            >
              {z}
            </button>
          ))}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "#1F3864", color: "#fff" }}>
              <th style={th}>Estado</th>
              <th style={th}>Zona de Riesgo</th>
              <th style={th}>Tasa Homicidio</th>
              <th style={th}>Tasa Robo</th>
              <th style={th}>Tasa Feminicidio</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((row, i) => (
              <tr key={row.Estado}
                style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                <td style={td}>{row.Estado}</td>
                <td style={{ ...td, textAlign: "left" }}>
                  <span className={BADGE_CLASS[row.Zona_Riesgo]}>
                    {row.Zona_Riesgo}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "left" }}>{Number(row.Tasa_Homicidio).toFixed(2)}</td>
                <td style={{ ...td, textAlign: "left" }}>{Number(row.Tasa_Robo).toFixed(2)}</td>
                <td style={{ ...td, textAlign: "left" }}>{Number(row.Tasa_Feminicidio).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "0.8rem", fontSize: "0.8rem", color: "#888" }}>
          Mostrando {datosFiltrados.length} de {datos.length} estados
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: "10px 14px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "0.85rem",
};

const td = {
  padding: "9px 14px",
  borderBottom: "1px solid #eee",
};

export default Kmeans;
