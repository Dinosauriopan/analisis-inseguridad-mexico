from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────
app = FastAPI(
    title="API — Inseguridad en México 2020-2025",
    description="Backend para el análisis de incidencia delictiva por entidad federativa.",
    version="1.0.0"
)

# CORS — permite que React (Vercel) consuma esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiar por tu dominio de Vercel
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# CARGA DE DATOS
# ─────────────────────────────────────────────
df = pd.read_csv("data/Delitos_Poblacion.csv", encoding="utf-8-sig")
df_kmeans = pd.read_csv("data/estados_zonas_riesgo.csv", encoding="utf-8-sig")

# Calcular tasas si no existen
if "Tasa_Homicidio" not in df.columns:
    df["Tasa_Homicidio"]   = (df["Homicidio"]   / df["Población"]) * 100_000
    df["Tasa_Robo"]        = (df["Robo"]        / df["Población"]) * 100_000
    df["Tasa_Feminicidio"] = (df["Feminicidio"] / df["Población"]) * 100_000
    df = df.round(3)

# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "mensaje": "API de Inseguridad en México 2020-2025",
        "endpoints": [
            "/api/estados",
            "/api/años",
            "/api/delitos",
            "/api/kmeans",
            "/api/resumen",
            "/api/tendencia",
        ]
    }


# ── 1. Lista de estados disponibles ──────────
@app.get("/api/estados")
def get_estados():
    """Devuelve la lista de los 32 estados."""
    estados = sorted(df["Estado"].unique().tolist())
    return {"total": len(estados), "estados": estados}


# ── 2. Lista de años disponibles ─────────────
@app.get("/api/años")
def get_anios():
    """Devuelve los años disponibles en el dataset."""
    anios = sorted(df["Año"].unique().tolist())
    return {"años": anios}


# ── 3. Datos de delitos con filtros ──────────
@app.get("/api/delitos")
def get_delitos(
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    año:    Optional[int]  = Query(None, description="Filtrar por año"),
):
    """
    Devuelve registros de delitos.
    Acepta filtros opcionales por estado y/o año.
    """
    resultado = df.copy()

    if estado:
        resultado = resultado[resultado["Estado"].str.lower() == estado.lower()]
    if año:
        resultado = resultado[resultado["Año"] == año]

    if resultado.empty:
        return {"total": 0, "datos": []}

    return {
        "total": len(resultado),
        "datos": resultado.to_dict(orient="records")
    }


# ── 4. Resultados K-Means ─────────────────────
@app.get("/api/kmeans")
def get_kmeans(
    zona: Optional[str] = Query(None, description="Filtrar por zona: 'Riesgo Alto', 'Riesgo Medio', 'Riesgo Bajo'")
):
    """
    Devuelve la clasificación de estados por zona de riesgo
    generada por el modelo K-Means.
    """
    resultado = df_kmeans.copy()

    if zona:
        resultado = resultado[resultado["Zona_Riesgo"].str.lower() == zona.lower()]

    return {
        "total": len(resultado),
        "datos": resultado.to_dict(orient="records")
    }


# ── 5. Resumen nacional por año ───────────────
@app.get("/api/resumen")
def get_resumen():
    """
    Devuelve totales nacionales agrupados por año:
    suma de delitos y promedio de tasas.
    """
    resumen = (
        df.groupby("Año")
        .agg(
            Total_Homicidio   = ("Homicidio",       "sum"),
            Total_Robo        = ("Robo",            "sum"),
            Total_Feminicidio = ("Feminicidio",     "sum"),
            Tasa_Homicidio    = ("Tasa_Homicidio",  "mean"),
            Tasa_Robo         = ("Tasa_Robo",       "mean"),
            Tasa_Feminicidio  = ("Tasa_Feminicidio","mean"),
        )
        .round(3)
        .reset_index()
    )
    return {"datos": resumen.to_dict(orient="records")}


# ── 6. Tendencia por estado ───────────────────
@app.get("/api/tendencia/{estado}")
def get_tendencia(estado: str):
    """
    Devuelve la evolución anual de tasas delictivas
    para un estado específico (2020-2025).
    """
    resultado = df[df["Estado"].str.lower() == estado.lower()]

    if resultado.empty:
        return {"error": f"Estado '{estado}' no encontrado.", "datos": []}

    cols = ["Año", "Tasa_Homicidio", "Tasa_Robo", "Tasa_Feminicidio",
            "Homicidio", "Robo", "Feminicidio", "Población"]
    resultado = resultado[cols].sort_values("Año")

    # Zona de riesgo del estado
    zona_row = df_kmeans[df_kmeans["Estado"].str.lower() == estado.lower()]
    zona = zona_row["Zona_Riesgo"].values[0] if not zona_row.empty else "Sin clasificar"

    return {
        "estado":      estado,
        "zona_riesgo": zona,
        "datos":       resultado.to_dict(orient="records")
    }


# ── 7. Comparación entre dos estados ─────────
@app.get("/api/comparar")
def get_comparar(
    estado1: str = Query(..., description="Primer estado"),
    estado2: str = Query(..., description="Segundo estado"),
):
    """
    Devuelve datos de dos estados para comparación directa.
    """
    datos = {}
    for estado in [estado1, estado2]:
        fila = df[df["Estado"].str.lower() == estado.lower()]
        if fila.empty:
            datos[estado] = {"error": "No encontrado"}
        else:
            datos[estado] = fila.sort_values("Año").to_dict(orient="records")

    return {"comparacion": datos}

df_numbeo = pd.read_csv("data/comparacion_kmeans_numbeo.csv", encoding="utf-8-sig")
 
@app.get("/api/scraping")
def get_scraping(solo_con_datos: bool = Query(False, description="True = solo estados con índice de Numbeo")):
    resultado = df_numbeo.copy()
    if solo_con_datos:
        resultado = resultado.dropna(subset=["Indice_Criminalidad"])
    # Convertir NaN a None de forma compatible con Python 3.13
    datos = [
        {k: (None if isinstance(v, float) and v != v else v) for k, v in row.items()}
        for row in resultado.to_dict(orient="records")
    ]
    return {
        "total":             len(datos),
        "con_indice_numbeo": int(df_numbeo["Indice_Criminalidad"].notna().sum()),
        "datos":             datos
    }