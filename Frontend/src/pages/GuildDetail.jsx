import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";
import Button from "../components/buttons/Button";
import FormulaCard from "../components/FormulaCard";
import FormulaForm from "../components/FormulaForm";
import GuildRanking from "../components/GuildRanking";
import { AuthContext } from "../context/AuthContext";

import guildsIniciales from "../data/guilds";
import formulasIniciales from "../data/formulas";

const MAX_SENIOR_ALCHEMISTS = 3;
const HORAS_LIMITE_TASTER = 48;
function GuildDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [guild, setGuild] = useState(null);
  const [formulas, setFormulas] = useState([]);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const guardados = localStorage.getItem("guilds");

    if (guardados) {
      const guildsGuardados = JSON.parse(guardados);

      const guildEncontrado = guildsGuardados.find(
        (guild) => guild.id === Number(id),
      );

      setGuild(guildEncontrado);
    } else {
      const guildEncontrado = guildsIniciales.find(
        (guild) => guild.id === Number(id),
      );

      setGuild(guildEncontrado);
    }
  }, [id]);

  useEffect(() => {
    const guardadas = localStorage.getItem("formulas");

    if (guardadas) {
      setFormulas(JSON.parse(guardadas));
    } else {
      setFormulas(formulasIniciales);
    }
  }, []);

  useEffect(() => {
    if (formulas.length > 0) {
      localStorage.setItem("formulas", JSON.stringify(formulas));
    }
  }, [formulas]);

  // Revisa participación en las últimas 5 fórmulas votables del gremio.
  // Si un miembro quedó por debajo del 30%, se le bloquea la creación
  // de fórmulas por 7 días (a menos que ya tenga un bloqueo activo).
  useEffect(() => {
    if (!guild) return;

    const formulasDelGremio = formulas.filter(
      (f) => f.guildId === Number(id),
    );

    const formulasRecientes = formulasDelGremio
      .filter((f) => f.state !== "Proposal")
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    if (formulasRecientes.length < 5) return;

    const ahora = new Date();
    let huboCambios = false;

    const miembrosActualizados = guild.members.map((member) => {
      const yaRestringido =
        member.restrictedUntil && new Date(member.restrictedUntil) > ahora;

      if (yaRestringido) return member;

      const participadas = formulasRecientes.filter((f) =>
        ["ingredient", "method", "flask"].some(
          (categoria) => f.votes?.[categoria]?.[member.id] !== undefined,
        ),
      ).length;

      const porcentaje = (participadas / formulasRecientes.length) * 100;

      if (porcentaje < 30) {
        huboCambios = true;

        const restrictedUntil = new Date();
        restrictedUntil.setDate(restrictedUntil.getDate() + 7);

        return { ...member, restrictedUntil: restrictedUntil.toISOString() };
      }

      return member;
    });

    if (huboCambios) {
      actualizarGuild({ ...guild, members: miembrosActualizados });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulas, guild?.id]);

  // Si el Taster Oficial no vota dentro de las 48 horas
  // después de abrirse una fórmula, pierde el rol.
  useEffect(() => {
    if (!guild || formulas.length === 0) return;

    const taster = guild.members.find(
      (member) => member.role === "Taster",
    );

    if (!taster) return;

    let huboCambios = false;

    const miembrosActualizados = guild.members.map((member) => {
      if (member.role !== "Taster") return member;

      const formulasAbiertas = formulas.filter(
        (formula) =>
          formula.guildId === Number(id) &&
          formula.state === "VotingOpen",
      );

      for (const formula of formulasAbiertas) {
        const entradaVotingOpen = formula.stateHistory?.find(
          (entrada) => entrada.state === "VotingOpen",
        );

        if (!entradaVotingOpen) continue;

        const fechaApertura = new Date(entradaVotingOpen.changedAt);
        const ahora = new Date();

        const horasTranscurridas =
          (ahora - fechaApertura) / (1000 * 60 * 60);

        const yaVoto =
          formula.votes?.ingredient?.[member.id] !== undefined ||
          formula.votes?.method?.[member.id] !== undefined ||
          formula.votes?.flask?.[member.id] !== undefined;

        if (
          horasTranscurridas >= HORAS_LIMITE_TASTER &&
          !yaVoto
        ) {
          huboCambios = true;

          return {
            ...member,
            role: "Apprentice",
          };
        }
      }

      return member;
    });

    if (huboCambios) {
      actualizarGuild({
        ...guild,
        members: miembrosActualizados,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulas, guild?.id]);

  function crearFormula(nuevaFormula) {
    const formulaConGuild = {
      ...nuevaFormula,
      guildId: Number(id),
    };

    setFormulas([...formulas, formulaConGuild]);
  }

  // Guarda el gremio actualizado tanto en el estado como en localStorage
  function actualizarGuild(guildActualizado) {
    const guardados = localStorage.getItem("guilds");
    const listaGuilds = guardados ? JSON.parse(guardados) : guildsIniciales;

    const listaActualizada = listaGuilds.map((g) =>
      g.id === guildActualizado.id ? guildActualizado : g,
    );

    localStorage.setItem("guilds", JSON.stringify(listaActualizada));
    setGuild(guildActualizado);
  }

  function unirseAlGremio() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (guild.type === "Private" && inviteCodeInput.trim() !== guild.inviteCode) {
      setJoinError("Código de invitación incorrecto.");
      return;
    }

    const nuevoMiembro = {
      id: user.id,
      name: user.name,
      specialty: user.specialty,
      role: "Apprentice",
      joinDate: new Date().toISOString().slice(0, 10),
    };

    actualizarGuild({ ...guild, members: [...guild.members, nuevoMiembro] });
    setJoinError("");
    setInviteCodeInput("");
  }
  function salirDelGremio() {
    if (!user || !yaEsMiembro) return;

    if (esGrandmaster) {
      setJoinError(
        "El Grandmaster no puede salir del gremio mientras sea su propietario.",
      );
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de que quieres salir de este gremio?",
    );

    if (!confirmar) return;

    const miembrosActualizados = guild.members.filter(
      (member) => member.id !== user.id,
    );

    actualizarGuild({
      ...guild,
      members: miembrosActualizados,
    });

    setJoinError("");
  }
  // Asciende a un Apprentice a Senior Alchemist (solo Grandmaster, máx. 3)
  function ascenderASenior(memberId) {
    if (!esGrandmaster || cantidadSenior >= MAX_SENIOR_ALCHEMISTS) return;

    const miembrosActualizados = guild.members.map((m) =>
      m.id === memberId && m.role === "Apprentice"
        ? { ...m, role: "Senior Alchemist" }
        : m,
    );

    actualizarGuild({ ...guild, members: miembrosActualizados });
  }

  // Regresa a un Senior Alchemist a Apprentice
  function bajarASenior(memberId) {
    if (!esGrandmaster) return;

    const miembrosActualizados = guild.members.map((m) =>
      m.id === memberId && m.role === "Senior Alchemist"
        ? { ...m, role: "Apprentice" }
        : m,
    );

    actualizarGuild({ ...guild, members: miembrosActualizados });
  }

  // Nombra al Taster Oficial; si ya había uno, ese vuelve a Apprentice
  function nombrarTaster(memberId) {
    if (!esGrandmaster) return;

    const miembrosActualizados = guild.members.map((m) => {
      if (m.role === "Taster") return { ...m, role: "Apprentice" };
      if (m.id === memberId) return { ...m, role: "Taster" };
      return m;
    });

    actualizarGuild({ ...guild, members: miembrosActualizados });
  }

  function quitarTaster(memberId) {
    if (!esGrandmaster) return;

    const miembrosActualizados = guild.members.map((m) =>
      m.id === memberId && m.role === "Taster"
        ? { ...m, role: "Apprentice" }
        : m,
    );

    actualizarGuild({ ...guild, members: miembrosActualizados });
  }

  if (!guild) {
    return (
      <>
        <NavBar />

        <main className="min-h-screen bg-app-bg p-8">
          <h1 className="text-3xl font-bold text-app-text">
            Gremio no encontrado
          </h1>

          <Link
            to="/gremios"
            className="inline-block mt-4 text-purple-accent hover:underline"
          >
            ← Volver a gremios
          </Link>
        </main>
      </>
    );
  }

  const guildFormulas = formulas.filter(
    (formula) => formula.guildId === Number(id),
  );

  const miMembresia = user
    ? guild.members.find((m) => m.id === user.id)
    : null;
  const miRol = miMembresia?.role;
  const yaEsMiembro = Boolean(miMembresia);
  const esGrandmaster = miRol === "Grandmaster";
  const estaRestringido =
    miMembresia?.restrictedUntil &&
    new Date(miMembresia.restrictedUntil) > new Date();
  const puedeCrearFormula =
    (miRol === "Grandmaster" || miRol === "Senior Alchemist") &&
    !estaRestringido;
  const cantidadSenior = guild.members.filter(
    (m) => m.role === "Senior Alchemist",
  ).length;

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-app-bg p-8">
        <section className="max-w-4xl mx-auto">

          <Link
            to="/gremios"
            className="text-purple-accent hover:underline"
          >
            ← Volver a gremios
          </Link>

          <Card className="p-6 mt-6">
            <div className="text-5xl mb-4">
              {guild.emblem}
            </div>

            <h1 className="text-3xl font-bold text-app-text">
              {guild.name}
            </h1>

            <p className="text-app-muted mt-2">
              {guild.motto}
            </p>

            <p className="text-sm text-purple-accent mt-4">
              {guild.type === "Private" ? "Privado" : "Público"}
            </p>

            <div className="mt-4">
              {!user ? (
                <Button onClick={() => navigate("/login")}>
                  Inicia sesión para unirte
                </Button>
              ) : yaEsMiembro ? (
                <div>
                  <p className="text-sm text-app-muted">
                    Ya eres miembro de este gremio.
                  </p>

                  {!esGrandmaster && (
                    <button
                      type="button"
                      onClick={salirDelGremio}
                      className="mt-3 px-4 py-2 rounded-button border border-red-500 text-red-400 font-semibold hover:bg-red-500/10 transition"
                    >
                      Salir del gremio
                    </button>
                  )}

                  {esGrandmaster && (
                    <p className="text-xs text-app-muted mt-2">
                      Como Grandmaster, no puedes abandonar el gremio mientras seas su propietario.
                    </p>
                  )}
                </div>
              ) : guild.type === "Private" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    unirseAlGremio();
                  }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <label htmlFor="invite-code" className="sr-only">
                    Código de invitación
                  </label>

                  <input
                    id="invite-code"
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="Código de invitación"
                    maxLength={6}
                    className="p-2.5 rounded-button border border-app-border bg-app-surface text-app-text"
                  />

                  <Button type="submit">
                    Unirse con código
                  </Button>
                </form>
              ) : (
                <Button onClick={unirseAlGremio}>
                  Unirse al gremio
                </Button>
              )}

              {joinError && (
                <p className="text-red-500 text-sm mt-2">
                  {joinError}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-4">
              Miembros
            </h2>

            <p className="text-sm text-app-muted mb-4">
              Senior Alchemists: {cantidadSenior}/{MAX_SENIOR_ALCHEMISTS} ·{" "}
              Taster Oficial: {guild.members.some((m) => m.role === "Taster")
                ? "asignado"
                : "sin asignar"}
            </p>

            {guild.members && guild.members.length > 0 ? (
              <ul className="space-y-3">
                {guild.members.map((member) => (
                  <li
                    key={member.id}
                    className="p-4 rounded-button bg-app-bg border border-app-border"
                  >
                    <h3 className="font-semibold text-app-text">
                      {member.name}
                    </h3>

                    <p className="text-sm text-app-muted">
                      Especialidad: {member.specialty}
                    </p>

                    <p className="text-sm text-purple-accent">
                      Rol: {member.role}
                    </p>

                    <p className="text-sm text-app-muted">
                      Se unió: {member.joinDate}
                    </p>

                    {/* Controles de rol, solo visibles para el Grandmaster */}
                    {esGrandmaster && member.role !== "Grandmaster" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {member.role === "Apprentice" && (
                          <button
                            type="button"
                            onClick={() => ascenderASenior(member.id)}
                            disabled={cantidadSenior >= MAX_SENIOR_ALCHEMISTS}
                            className="text-sm px-3 py-1.5 rounded-button bg-purple-accent text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Ascender a Senior Alchemist
                          </button>
                        )}

                        {member.role === "Senior Alchemist" && (
                          <button
                            type="button"
                            onClick={() => bajarASenior(member.id)}
                            className="text-sm px-3 py-1.5 rounded-button border border-app-border text-app-text hover:bg-app-surface transition"
                          >
                            Bajar a Apprentice
                          </button>
                        )}

                        {member.role === "Taster" ? (
                          <button
                            type="button"
                            onClick={() => quitarTaster(member.id)}
                            className="text-sm px-3 py-1.5 rounded-button border border-app-border text-app-text hover:bg-app-surface transition"
                          >
                            Quitar como Taster
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => nombrarTaster(member.id)}
                            className="text-sm px-3 py-1.5 rounded-button bg-purple-accent text-white hover:opacity-90 transition"
                          >
                            Nombrar Taster Oficial
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-app-muted">
                Este gremio todavía no tiene miembros.
              </p>
            )}
          </Card>

          {estaRestringido && (
            <Card className="p-4 mt-6 border-red-500/50">
              <p className="text-sm text-red-400">
                Tu participación en las últimas fórmulas estuvo por debajo
                del 30%, así que no puedes crear fórmulas nuevas hasta el{" "}
                {new Date(miMembresia.restrictedUntil).toLocaleDateString()}.
              </p>
            </Card>
          )}

          <FormulaForm onCreateFormula={crearFormula} canCreate={puedeCrearFormula} />

          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-4">
              Fórmulas
            </h2>

            {guildFormulas.length === 0 ? (
              <p className="text-app-muted">
                Este gremio todavía no tiene fórmulas.
              </p>
            ) : (
              <div className="space-y-4">
                {guildFormulas.map((formula) => (
                  <FormulaCard
                    key={formula.id}
                    formula={formula}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-2">
              Ranking del gremio
            </h2>

            <p className="text-sm text-app-muted mb-4">
              Puntos de alquimia (+10 por fórmula creada, +20 por destilada),
              rareza acumulada, participación en las últimas 5 fórmulas
              votables y, si aplica, el % de acierto del Taster Oficial.
            </p>

            <GuildRanking members={guild.members} formulas={guildFormulas} />
          </Card>

        </section>
      </main>
    </>
  );
}

export default GuildDetail;