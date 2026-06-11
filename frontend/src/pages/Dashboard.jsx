import { useEffect, useState } from "react";
import { getResumen, getEstados } from "../services/api";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [resumen, setResumen]   = useState([]);
  const [estados, setEstados]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getResumen(), getEstados()])
      .then(([res, est]) => {
        setResumen(res);
        setEstados(est);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando datos...</div>;

  // Totales acumulados
  const totalHomicidio   = resumen.reduce((s, r) => s + r.Total_Homicidio,   0);
  const totalRobo        = resumen.reduce((s, r) => s + r.Total_Robo,        0);
  const totalFeminicidio = resumen.reduce((s, r) => s + r.Total_Feminicidio, 0);

  return (
    <div>
      <h1 className="section-title"> Dashboard General</h1>

      {/* Tarjetas resumen */}
      <div className="grid-4">
        <div className="card" style={{ borderTop: "4px solid #1F3864" }}>
          <div className="card-title">Estados analizados</div>
          <div className="card-value">{estados.length}</div>
          <div className="card-sub">Entidades federativas</div>
        </div>
        <div className="card" style={{ borderTop: "4px solid #C0392B" }}>
          <div className="card-title">Homicidios dolosos</div>
          <div className="card-value">{totalHomicidio.toLocaleString()}</div>
          <div className="card-sub">Acumulado 2020–2025</div>
        </div>
        <div className="card" style={{ borderTop: "4px solid #E67E22" }}>
          <div className="card-title">Robos</div>
          <div className="card-value">{totalRobo.toLocaleString()}</div>
          <div className="card-sub">Acumulado 2020–2025</div>
        </div>
        <div className="card" style={{ borderTop: "4px solid #8E44AD" }}>
          <div className="card-title">Feminicidios</div>
          <div className="card-value">{totalFeminicidio.toLocaleString()}</div>
          <div className="card-sub">Acumulado 2020–2025</div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid-2">

        {/* Líneas — tasa homicidio por año */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Tasa promedio de Homicidio Doloso por año
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={resumen}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="Año" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="Tasa_Homicidio"
                stroke="#C0392B"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Tasa Homicidio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Barras — tasa robo por año */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Tasa promedio de Robo por año
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={resumen}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="Año" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Tasa_Robo" fill="#E67E22" radius={[4,4,0,0]} name="Tasa Robo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Líneas — tasa feminicidio por año */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Tasa promedio de Feminicidio por año
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={resumen}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="Año" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="Tasa_Feminicidio"
                stroke="#8E44AD"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Tasa Feminicidio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Barras agrupadas — comparativa de tasas */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "1rem" }}>
            Comparativa de tasas por año
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={resumen}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="Año" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tasa_Homicidio"   fill="#C0392B" radius={[4,4,0,0]} name="Homicidio" />
              <Bar dataKey="Tasa_Feminicidio" fill="#8E44AD" radius={[4,4,0,0]} name="Feminicidio" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
