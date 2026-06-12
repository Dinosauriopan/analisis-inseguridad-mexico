import { useEffect, useState } from "react";
import { getEstados, getTendencia } from "../services/api";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

const DELITOS = [
  { key: "Tasa_Homicidio",   label: "Homicidio Doloso", color: "#C0392B" },
  { key: "Tasa_Robo",        label: "Robo",             color: "#E67E22" },
  { key: "Tasa_Feminicidio", label: "Feminicidio",      color: "#8E44AD" },
];

const BADGE_CLASS = {
  "Riesgo Alto":  "badge badge-alto",
  "Riesgo Medio": "badge badge-medio",
  "Riesgo Bajo":  "badge badge-bajo",
};

function Tendencia() {
  const [estados,   setEstados]   = useState([]);
  const [estadoSel, setEstadoSel] = useState("Jalisco");
  const [añoSel,    setAñoSel]    = useState("Todos");
  const [delitoSel, setDelitoSel] = useState("Todos");
  const [tendencia, setTendencia] = useState(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    getEstados().then(setEstados);
  }, []);

  useEffect(() => {
    if (!estadoSel) return;
    setLoading(true);
    getTendencia(estadoSel)
      .then(setTendencia)
      .finally(() => setLoading(false));
  }, [estadoSel]);

  const datosFiltrados = tendencia?.datos
    ? añoSel === "Todos"
      ? tendencia.datos
      : tendencia.datos.filter((d) => d.Año === parseInt(añoSel))
    : [];

  const delitosMostrar = delitoSel === "Todos"
    ? DELITOS
    : DELITOS.filter((d) => d.key === delitoSel);

  const años = tendencia?.datos
    ? ["Todos", ...tendencia.datos.map((d) => d.Año)]
    : ["Todos"];

  return (
    <div>
      <h1 className="section-title">Tendencia por Estado</h1>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="filtros-row" style={{ marginBottom: 0, flexDirection: "column", gap: "1rem" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="filtros-label">Estado</span>
            <select className="filtro-select" value={estadoSel}
              onChange={(e) => setEstadoSel(e.target.value)}>
              {estados.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="filtros-label">Año</span>
            <select className="filtro-select" value={añoSel}
              onChange={(e) => setAñoSel(e.target.value)}>
              {años.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="filtros-label">Tipo de delito</span>
            <select className="filtro-select" value={delitoSel}
              onChange={(e) => setDelitoSel(e.target.value)}>
              <option value="Todos">Todos</option>
              {DELITOS.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>

          {tendencia && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="filtros-label">Zona de riesgo</span>
              <span className={BADGE_CLASS[tendencia.zona_riesgo] || "badge"}
                style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
                {tendencia.zona_riesgo}
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="loading">Cargando...</div>}

      {/* Vista: año específico seleccionado */}
      {!loading && tendencia && añoSel !== "Todos" && (
        <div>
          <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
            {delitosMostrar.map((d) => (
              <div className="card" key={d.key}
                style={{ borderTop: `4px solid ${d.color}` }}>
                <div className="card-title">{d.label}</div>
                <div className="card-value" style={{ color: d.color }}>
                  {datosFiltrados[0]?.[d.key] ?? "—"}
                </div>
                <div className="card-sub">Tasa por 100,000 hab. — {añoSel}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: "1rem" }}>
              Tasas delictivas — {estadoSel} ({añoSel})
            </div>
            <ResponsiveContainer width="100%" height={window.innerWidth < 480 ? 200 : 250}>
              <BarChart data={delitosMostrar.map((d) => ({
                delito: d.label,
                valor:  datosFiltrados[0]?.[d.key] ?? 0,
                color:  d.color,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="delito" />
                <YAxis />
                <Tooltip formatter={(v) => `${v} por 100k hab.`} />
                <Bar dataKey="valor" radius={[6,6,0,0]} name="Tasa">
                  {delitosMostrar.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vista: todos los años */}
      {!loading && tendencia && añoSel === "Todos" && (
        <div>
          {delitoSel !== "Todos" ? (
            <div className="card">
              <div className="card-title" style={{ marginBottom: "1rem" }}>
                {DELITOS.find((d) => d.key === delitoSel)?.label} — {estadoSel} (2020–2025)
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={tendencia.datos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="Año" />
                  <YAxis />
                  <Tooltip formatter={(v) => `${v} por 100k hab.`} />
                  {delitosMostrar.map((d) => (
                    <Line key={d.key} type="monotone" dataKey={d.key}
                      stroke={d.color} strokeWidth={2.5}
                      dot={{ r: 5 }} name={d.label} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid-2">
              {DELITOS.map((d) => (
                <div className="card" key={d.key}>
                  <div className="card-title" style={{ marginBottom: "1rem" }}>
                    {d.label} — {estadoSel}
                  </div>
                  <ResponsiveContainer width="100%" height={window.innerWidth < 480 ? 200 : 230}>
                    <LineChart data={tendencia.datos}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="Año" />
                      <YAxis />
                      <Tooltip formatter={(v) => `${v} por 100k hab.`} />
                      <Line type="monotone" dataKey={d.key}
                        stroke={d.color} strokeWidth={2.5}
                        dot={{ r: 4 }} name={d.label} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
              <div className="card">
                <div className="card-title" style={{ marginBottom: "1rem" }}>
                  Comparativa de los 3 delitos — {estadoSel}
                </div>
                <ResponsiveContainer width="100%" height={window.innerWidth < 480 ? 200 : 230}>
                  <LineChart data={tendencia.datos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="Año" />
                    <YAxis />
                    <Tooltip formatter={(v) => `${v} por 100k hab.`} />
                    <Legend />
                    {DELITOS.map((d) => (
                      <Line key={d.key} type="monotone" dataKey={d.key}
                        stroke={d.color} strokeWidth={2}
                        dot={{ r: 3 }} name={d.label} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Tendencia;
