import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { getKmeans } from "../services/api";

const GEO_URL = "/mexico.json";

const COLOR_ZONA = {
  "Riesgo Alto":  "#C0392B",
  "Riesgo Medio": "#E67E22",
  "Riesgo Bajo":  "#27AE60",
};

const COLOR_DEFAULT = "#CBD5E0";

const BADGE_CLASS = {
  "Riesgo Alto":  "badge badge-alto",
  "Riesgo Medio": "badge badge-medio",
  "Riesgo Bajo":  "badge badge-bajo",
};

// Mapa de nombres del GeoJSON → nombres del CSV
// (el GeoJSON puede tener nombres distintos)
const NOMBRE_MAP = {
  "Baja California Norte": "Baja California",
  "Coahuila":  "Coahuila de Zaragoza",
  "Michoacán":             "Michoacan de Ocampo",
  "Michoacan":             "Michoacan de Ocampo",
  "México":                "Estado de Mexico",
  "Ciudad de México":                "Ciudad de Mexico",
  "Veracruz":              "Veracruz de Ignacio de la Llave",
  "Querétaro":             "Queretaro",
  "Nuevo León":            "Nuevo Leon",
  "Yucatán":               "Yucatan",
  "San Luis Potosí":       "San Luis Potosi",
  "Nayarit":               "Nayarit",
};

function normalizarNombre(nombre) {
  if (!nombre) return "";
  return NOMBRE_MAP[nombre] || nombre;
}

function MapaRiesgo() {
  const [kmeans,   setKmeans]   = useState([]);
  const [tooltip,  setTooltip]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getKmeans().then(setKmeans).finally(() => setLoading(false));
  }, []);

  const getZona = (nombreGeo) => {
    const nombreNorm = normalizarNombre(nombreGeo);
    const estado = kmeans.find(
      (d) => d.Estado.toLowerCase() === nombreNorm.toLowerCase() ||
             d.Estado.toLowerCase() === nombreGeo?.toLowerCase()
    );
    return estado ? estado.Zona_Riesgo : null;
  };

  const getColor = (nombreGeo) => {
    const zona = getZona(nombreGeo);
    return zona ? COLOR_ZONA[zona] : COLOR_DEFAULT;
  };

  if (loading) return <div className="loading">Cargando mapa...</div>;

  return (
    <div>
      <h1 className="section-title">Mapa de Zonas de Riesgo — México</h1>

      {/* Leyenda */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {Object.entries(COLOR_ZONA).map(([zona, color]) => (
          <div key={zona} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: color, flexShrink: 0
            }} />
            <span style={{ fontSize: "0.9rem", color: "#333" }}>{zona}</span>
            <span style={{ fontSize: "0.8rem", color: "#888" }}>
              ({kmeans.filter((d) => d.Zona_Riesgo === zona).length} estados)
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 16, height: 16, borderRadius: 4,
            background: COLOR_DEFAULT, flexShrink: 0
          }} />
          <span style={{ fontSize: "0.9rem", color: "#333" }}>Sin datos</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="card" style={{ position: "relative", padding: "1rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>
          Puedes hacer zoom y arrastrar el mapa
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1200, center: [-102, 24] }}
          style={{ width: "100%", height: "480px" }}
        >
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const nombre = geo.properties.name || geo.properties.NAME ||
                                 geo.properties.estado || geo.properties.ESTADO;
                  const zona   = getZona(nombre);
                  const color  = getColor(nombre);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={0.8}
                      style={{
                        default:  { outline: "none" },
                        hover:    { outline: "none", fill: color, opacity: 0.8, cursor: "pointer" },
                        pressed:  { outline: "none" },
                      }}
                      onMouseEnter={(e) => {
                        setTooltip({
                          nombre: nombre || "Estado",
                          zona:   zona || "Sin datos",
                          x:      e.clientX,
                          y:      e.clientY,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip flotante */}
        {tooltip && (
          <div style={{
            position: "fixed",
            left:     tooltip.x + 12,
            top:      tooltip.y - 40,
            background: "#fff",
            border:   "1px solid #ddd",
            borderRadius: 8,
            padding:  "8px 14px",
            fontSize: "0.85rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            pointerEvents: "none",
            zIndex: 1000,
          }}>
            <strong>{tooltip.nombre}</strong>
            <div>
              <span className={BADGE_CLASS[tooltip.zona] || "badge"}
                style={{ marginTop: 4, display: "inline-block" }}>
                {tooltip.zona}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabla resumen debajo del mapa */}
      <div className="grid-2" style={{ marginTop: "1.5rem" }}>
        {["Riesgo Alto", "Riesgo Medio", "Riesgo Bajo"].map((zona) => (
          <div className="card" key={zona}
            style={{ borderTop: `4px solid ${COLOR_ZONA[zona]}` }}>
            <div className="card-title" style={{ color: COLOR_ZONA[zona], marginBottom: "0.8rem" }}>
              {zona} — {kmeans.filter((d) => d.Zona_Riesgo === zona).length} estados
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {kmeans
                .filter((d) => d.Zona_Riesgo === zona)
                .sort((a, b) => a.Estado.localeCompare(b.Estado))
                .map((d) => (
                  <span key={d.Estado} className={BADGE_CLASS[zona]}
                    style={{ fontSize: "0.78rem" }}>
                    {d.Estado}
                  </span>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapaRiesgo;
