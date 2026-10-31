import { useEffect, useState } from "react";
import NavBar from "../components/NavBarFinal";
import GuildCard from "../components/GuildCard";
import GuildForm from "../components/GuildForm";
import guildsIniciales from "../data/guilds";

function Guilds() {
  const [guilds, setGuilds] = useState([]);

  // Cuando entramos a la página, buscamos los gremios guardados
  useEffect(() => {
    const guardados = localStorage.getItem("guilds");

    if (guardados) {
      setGuilds(JSON.parse(guardados));
    } else {
      // Si todavía no hay nada guardado, usamos los datos iniciales
      setGuilds(guildsIniciales);
    }
  }, []);

  // Cada vez que cambia la lista, la guardamos
  useEffect(() => {
    if (guilds.length > 0) {
      localStorage.setItem("guilds", JSON.stringify(guilds));
    }
  }, [guilds]);

  function crearGuild(nuevoGuild) {
    setGuilds([...guilds, nuevoGuild]);
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <NavBar />

      <main className="max-w-5xl mx-auto p-8">

        <h1 className="text-3xl font-bold text-app-text mb-2">
          Gremios
        </h1>

        <p className="text-app-muted mb-6">
          Crea o únete a un gremio de alquimistas.
        </p>

        <GuildForm onCreateGuild={crearGuild} />

        <section>
          <h2 className="text-2xl font-bold text-app-text mb-4">
            Gremios disponibles
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {guilds.map((guild) => (
              <GuildCard
                key={guild.id}
                guild={guild}
              />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default Guilds;