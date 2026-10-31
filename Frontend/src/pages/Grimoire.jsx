import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";
import guildsIniciales from "../data/guilds";
import formulasIniciales from "../data/formulas";

function Grimoire() {
  const [pociones, setPociones] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // El grimorio junta, de todos los gremios, las fórmulas ya destiladas
  useEffect(() => {
    const guildsGuardados = localStorage.getItem("guilds");
    const formulasGuardadas = localStorage.getItem("formulas");

    const guilds = guildsGuardados
      ? JSON.parse(guildsGuardados)
      : guildsIniciales;

    const formulas = formulasGuardadas
      ? JSON.parse(formulasGuardadas)
      : formulasIniciales;

    const distiladas = formulas
      .filter((formula) => formula.state === "Distilled" && formula.finalPotion)
      .map((formula) => {
        const guild = guilds.find((g) => g.id === formula.guildId);

        return {
          ...formula,
          guildName: guild ? guild.name : "Gremio desconocido",
        };
      });

    setPociones(distiladas);
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

          {pocionesFiltradas.length === 0 ? (
            <p className="text-app-muted mt-6">
              {pociones.length === 0
                ? "Todavía no hay pociones destiladas."
                : "Ninguna poción coincide con tu búsqueda."}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              {pocionesFiltradas.map((pocion) => (
                <Card key={pocion.id} className="p-5">
                  <h2 className="text-xl font-bold text-app-text">
                    {pocion.finalPotion.finalName}
                  </h2>

                  <p className="text-sm text-purple-accent mt-1">
                    {pocion.guildName}
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
