import { useEffect, useState } from "react";
import NavBar from "../components/NavBarFinal";
import GuildCard from "../components/GuildCard";
import GuildForm from "../components/GuildForm";
import Button from "../components/buttons/Button";
import { guildService } from "../services/guildService";
import { obtenerMensajeError } from "../utils/errores";

function Guilds() {
  const [guilds, setGuilds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorCreacion, setErrorCreacion] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    guildService
      .listar()
      .then((lista) => {
        if (activo) setGuilds(lista);
      })
      .catch((e) => {
        if (activo) {
          setError(obtenerMensajeError(e, "No fue posible cargar los gremios."));
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  function reintentar() {
    setError("");
    setCargando(true);
    setIntento((anterior) => anterior + 1);
  }

  async function crearGuild(datos) {
    setErrorCreacion("");

    try {
      const creado = await guildService.crear({
        name: datos.name,
        motto: datos.motto,
        emblem: datos.emblem,
        type: datos.type,
        inviteCode: datos.inviteCode,
      });

      setGuilds((anteriores) => [creado, ...anteriores]);
    } catch (e) {
      setErrorCreacion(
        obtenerMensajeError(e, "No fue posible crear el gremio."),
      );
    }
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <NavBar />

      <main className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-app-text mb-2">Gremios</h1>

        <p className="text-app-muted mb-6">
          Crea o únete a un gremio de alquimistas.
        </p>

        <GuildForm onCreateGuild={crearGuild} />

        {errorCreacion && (
          <p className="text-red-500 text-sm mb-4" role="alert">
            {errorCreacion}
          </p>
        )}

        <section>
          <h2 className="text-2xl font-bold text-app-text mb-4">
            Gremios disponibles
          </h2>

          {cargando && (
            <p className="text-app-muted" role="status">
              Cargando gremios...
            </p>
          )}

          {!cargando && error && (
            <div role="alert">
              <p className="text-red-500 mb-3">{error}</p>
              <Button onClick={reintentar}>Reintentar</Button>
            </div>
          )}

          {!cargando && !error && guilds.length === 0 && (
            <p className="text-app-muted">Todavía no hay gremios creados.</p>
          )}

          {!cargando && !error && guilds.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {guilds.map((guild) => (
                <GuildCard key={guild.id} guild={guild} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Guilds;
