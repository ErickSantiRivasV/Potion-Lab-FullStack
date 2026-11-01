import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";
import { formulaService } from "../services/formulaService";
import { obtenerMensajeError } from "../utils/errores";

function Grimoire() {
  const [pociones, setPociones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    formulaService
      .listar({ state: "Distilled" })
      .then((lista) => {
        if (activo) setPociones(lista.filter((f) => f.finalPotion));
      })
      .catch((e) => {
        if (activo) {
          setError(
            obtenerMensajeError(e, "No fue posible cargar el grimorio."),
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const textoBusqueda = busqueda.trim().toLowerCase();

  const pocionesFiltradas = pociones.filter((pocion) => {
    if (textoBusqueda === "") return true;

    return (
      pocion.finalPotion.finalName.toLowerCase().includes(textoBusqueda) ||
      pocion.name.toLowerCase().includes(textoBusqueda) ||
      pocion.guildName.toLowerCase().includes(textoBusqueda)
    );
  });

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-app-bg p-8">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-app-text">Grimorio</h1>

          <p className="text-app-muted mt-2">
            Registro permanente y buscable de todas las pociones que ya
            fueron destiladas en cualquier gremio.
          </p>

          <label htmlFor="buscar-pocion" className="sr-only">
            Buscar poción
          </label>

          <input
            id="buscar-pocion"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por poción, fórmula o gremio..."
            className="w-full mt-6 p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          />

          {cargando && (
            <p className="text-app-muted mt-6" role="status">
              Cargando grimorio...
            </p>
          )}

          {!cargando && error && (
            <p className="text-red-500 mt-6" role="alert">
              {error}
            </p>
          )}

          {!cargando && !error && pocionesFiltradas.length === 0 && (
            <p className="text-app-muted mt-6">
              {pociones.length === 0
                ? "Todavía no hay pociones destiladas."
                : "Ninguna poción coincide con tu búsqueda."}
            </p>
          )}

          {!cargando && !error && pocionesFiltradas.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              {pocionesFiltradas.map((pocion) => (
                <Card key={pocion.id} className="p-5">
                  <h2 className="text-xl font-bold text-app-text">
                    {pocion.finalPotion.finalName}
                  </h2>

                  <p className="text-sm text-purple-accent mt-1">
                    {pocion.guildName || "Gremio desconocido"}
                  </p>

                  <p className="text-app-muted mt-2">
                    Fórmula original: {pocion.name}
                  </p>

                  <p className="text-sm text-app-muted mt-2">
                    Dificultad real: {pocion.finalPotion.realDifficulty} ·
                    Rareza: {pocion.finalPotion.rarity}
                  </p>

                  <Link
                    to={`/formula/${pocion.id}`}
                    className="inline-block mt-4 text-purple-accent hover:underline"
                  >
                    Ver fórmula completa
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Grimoire;
