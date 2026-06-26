import { useEffect, useState } from "react";
import axios from "axios";
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from "recharts";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

// Tooltip personalizado para el scatter
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: "#fff", border: "1px solid #ddd",
        borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem"
      }}>
        <strong>{d.Estado}</strong>
        <div style={{ color: COLOR_ZONA[d.Zona_Riesgo] }}>{d.Zona_Riesgo}</div>
        <div>Tasa Homicidio: <b>{d.Tasa_Homicidio?.toFixed(2)}</b></div>
        <div>Índice Criminalidad: <b>{d.Indice_Criminalidad}</b></div>
        <div>Índice Seguridad: <b>{d.Indice_Seguridad}</b></div>
      </div>
    );
  }
  return null;
};

function WebScraping() {
  const [todos,    setTodos]    = useState([]);
  const [conDatos, setConDatos] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [vista,    setVista]    = useState("todos"); // "todos" | "numbeo"

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/api/scraping`),
      axios.get(`${BASE_URL}/api/scraping?solo_con_datos=true`),
    ]).then(([r1, r2]) => {
      setTodos(r1.data.datos);
      setConDatos(r2.data.datos);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando datos de web scraping...</div>;

  const datosVista = vista === "todos" ? todos : conDatos;

  return (
    <div>
      <h1 className="section-title">Datos con Web Scraping</h1>

      {/* Info banner */}
      <div style={{
        background: "#EBF3FB", borderLeft: "4px solid #2E75B6",
        borderRadius: 8, padding: "12px 16px",
        marginBottom: "1.5rem", fontSize: "0.9rem", color: "#1F3864"
      }}>
        <strong>¿Qué es esto?</strong> Se cruzaron los resultados del modelo K-Means con el
        índice de criminalidad de <strong>Numbeo</strong> (percepción ciudadana) para validar
        que los estados clasificados como Riesgo Alto también tienen alta percepción de inseguridad.
        Se encontraron datos de Numbeo para <strong>{conDatos.length} de {todos.length} estados</strong>.
      </div>

      {/* Tarjetas resumen */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <div className="card" style={{ borderTop: "4px solid #1F3864" }}>
          <div className="card-title">Estados totales</div>
          <div className="card-value">{todos.length}</div>
          <div className="card-sub">En el análisis K-Means</div>
        </div>
        <div className="card" style={{ borderTop: "4px solid #2E75B6" }}>
          <div className="card-title">Con datos Numbeo</div>
          <div className="card-value">{conDatos.length}</div>
          <div className="card-sub">Con índice de criminalidad</div>
        </div>
        <div className="card" style={{ borderTop: "4px solid #C0392B" }}>
          <div className="card-title">Mayor índice</div>
          <div className="card-value" style={{ color: "#C0392B" }}>
            {Math.max(...conDatos.map((d) => d.Indice_Criminalidad))}
          </div>
          <div className="card-sub">
            {conDatos.find((d) =>
              d.Indice_Criminalidad === Math.max(...conDatos.map((x) => x.Indice_Criminalidad))
            )?.Estado}
          </div>
        </div>
        <div className="card" style={{ borderTop: "4px solid #27AE60" }}>
          <div className="card-title">Menor índice</div>
          <div className="card-value" style={{ color: "#27AE60" }}>
            {Math.min(...conDatos.map((d) => d.Indice_Criminalidad))}
          </div>
          <div className="card-sub">
            {conDatos.find((d) =>
              d.Indice_Criminalidad === Math.min(...conDatos.map((x) => x.Indice_Criminalidad))
            )?.Estado}
          </div>
        </div>
      </div>

      {/* Gráficas — solo estados con datos Numbeo */}
      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>

        {/* Barras: índice criminalidad por estado */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Índice de Criminalidad Numbeo por Estado
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[...conDatos].sort((a, b) => b.Indice_Criminalidad - a.Indice_Criminalidad)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="Estado" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Indice_Criminalidad" radius={[0,4,4,0]} name="Índice Criminalidad">
                {conDatos
                  .sort((a, b) => b.Indice_Criminalidad - a.Indice_Criminalidad)
                  .map((d) => (
                    <Cell key={d.Estado} fill={COLOR_ZONA[d.Zona_Riesgo]} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter: Tasa Homicidio vs Índice Criminalidad */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Tasa Homicidio (K-Means) vs Índice Numbeo
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                  dataKey="Tasa_Homicidio" 
                  name="Tasa Homicidio"
                  type="number"
                  domain={[0, 'auto']}
                  tickFormatter={(v) => Math.round(v)}
                  label={{ value: "Tasa Homicidio", position: "insideBottom", offset: -5, fontSize: 11 }}
                />
              <YAxis 
                  dataKey="Indice_Criminalidad" 
                  name="Índice Criminalidad"
                  type="number"
                  domain={[0, 100]}
                  label={{ value: "Índice Numbeo", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
              <Tooltip content={<CustomTooltip />} />
              {["Riesgo Alto", "Riesgo Medio", "Riesgo Bajo"].map((zona) => (
                <Scatter
                  key={zona}
                  name={zona}
                  data={conDatos.filter((d) => d.Zona_Riesgo === zona)}
                  fill={COLOR_ZONA[zona]}
                />
              ))}
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Tabla completa */}
      <div className="card">
        <div className="filtros-row" style={{ marginBottom: "1rem" }}>
          <span className="filtros-label">Mostrar:</span>
          {[
            { val: "todos",  label: `Todos los estados (${todos.length})` },
            { val: "numbeo", label: `Solo con datos Numbeo (${conDatos.length})` },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setVista(val)}
              style={{
                padding: "6px 14px", borderRadius: 20, border: "none",
                cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s",
                background: vista === val ? "#1F3864" : "#f0f4f8",
                color:      vista === val ? "#fff"    : "#555",
                fontWeight: vista === val ? 700 : 400,
              }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "#1F3864", color: "#fff" }}>
              <th style={th}>Estado</th>
              <th style={th}>Zona K-Means</th>
              <th style={th}>Tasa Homicidio</th>
              <th style={th}>Tasa Robo</th>
              <th style={th}>Tasa Feminicidio</th>
              <th style={th}>Índice Criminalidad</th>
              <th style={th}>Índice Seguridad</th>
            </tr>
          </thead>
          <tbody>
            {datosVista.map((row, i) => (
              <tr key={row.Estado}
                style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                <td style={td}>{row.Estado}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <span className={BADGE_CLASS[row.Zona_Riesgo]}>{row.Zona_Riesgo}</span>
                </td>
                <td style={{ ...td, textAlign: "center" }}>{row.Tasa_Homicidio?.toFixed(2)}</td>
                <td style={{ ...td, textAlign: "center" }}>{row.Tasa_Robo?.toFixed(2)}</td>
                <td style={{ ...td, textAlign: "center" }}>{row.Tasa_Feminicidio?.toFixed(3)}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  {row.Indice_Criminalidad != null
                    ? <span style={{
                        fontWeight: 700,
                        color: row.Indice_Criminalidad > 60 ? "#C0392B"
                             : row.Indice_Criminalidad > 40 ? "#E67E22"
                             : "#27AE60"
                      }}>{row.Indice_Criminalidad}</span>
                    : <span style={{ color: "#bbb" }}>Sin datos</span>
                  }
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  {row.Indice_Seguridad != null
                    ? <span style={{
                        fontWeight: 700,
                        color: row.Indice_Seguridad > 60 ? "#27AE60"
                             : row.Indice_Seguridad > 40 ? "#E67E22"
                             : "#C0392B"
                      }}>{row.Indice_Seguridad}</span>
                    : <span style={{ color: "#bbb" }}>Sin datos</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div style={{ marginTop: "0.8rem", fontSize: "0.8rem", color: "#888" }}>
          Fuente K-Means: SESNSP / INEGI · Fuente Índices: Numbeo.com
        </div>
      </div>
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" };
const td = { padding: "9px 14px", borderBottom: "1px solid #eee" };

export default WebScraping;
