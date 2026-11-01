import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";
import Button from "../components/buttons/Button";
import FormulaCard from "../components/FormulaCard";
import FormulaForm from "../components/FormulaForm";
import GuildRanking from "../components/GuildRanking";
import { AuthContext } from "../context/AuthContext";
import { guildService } from "../services/guildService";
import { formulaService } from "../services/formulaService";
import { obtenerMensajeError } from "../utils/errores";

const MAX_SENIOR_ALCHEMISTS = 3;

const CLASE_INPUT =
  "w-full p-2.5 rounded-button border border-app-border bg-app-surface text-app-text";

const GUILD_INICIAL = {
  id: "",
  name: "",
  motto: "",
  type: "Public",
  emblem: "",
  inviteCode: null,
  members: [],
};

function GuildDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [guild, setGuild] = useState(GUILD_INICIAL);
  const [cargado, setCargado] = useState(false);
  const [formulas, setFormulas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorFormulas, setErrorFormulas] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [errorFormula, setErrorFormula] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [editando, setEditando] = useState(false);
  const [formEdicion, setFormEdicion] = useState({
    name: "",
    motto: "",
    emblem: "",
    type: "Public",
    inviteCode: "",
  });

  useEffect(() => {
    let activo = true;

    guildService
      .obtener(id)
      .then((encontrado) => {
        if (activo) {
          setGuild(encontrado);
          setCargado(true);
        }
      })
      .catch((e) => {
        if (activo) {
          setErrorCarga(
            obtenerMensajeError(e, "No fue posible cargar el gremio."),
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    formulaService
      .listar({ guildId: id })
      .then((lista) => {
        if (activo) setFormulas(lista);
      })
      .catch((e) => {
        if (activo) {
          setErrorFormulas(
            obtenerMensajeError(e, "No fue posible cargar las fórmulas."),
          );
        }
      });

    return () => {
      activo = false;
    };
  }, [id]);

  async function recargarFormulas() {
    try {
      const lista = await formulaService.listar({ guildId: id });
      setFormulas(lista);
      setErrorFormulas("");
    } catch (e) {
      setFormulas([]);
      setErrorFormulas(
        obtenerMensajeError(e, "No fue posible cargar las fórmulas."),
      );
    }
  }

  async function unirseAlGremio() {
    if (!user) {
      navigate("/login");
      return;
    }

    setJoinError("");

    try {
      const actualizado = await guildService.unirse(guild.id, inviteCodeInput);

      setGuild(actualizado);
      setInviteCodeInput("");
      await recargarFormulas();
    } catch (e) {
      setJoinError(
        obtenerMensajeError(e, "No fue posible unirte al gremio."),
      );
    }
  }

  async function salirDelGremio() {
    if (!user || !yaEsMiembro || esGrandmaster) return;

    const confirmar = window.confirm(
      "¿Estás seguro de que quieres salir de este gremio?",
    );

    if (!confirmar) return;

    setJoinError("");

    try {
      await guildService.salir(guild.id);
      navigate("/gremios");
    } catch (e) {
      setJoinError(obtenerMensajeError(e, "No fue posible salir del gremio."));
    }
  }

  async function cambiarRol(miembroId, rol) {
    setErrorAccion("");

    try {
      const actualizado = await guildService.cambiarRol(
        guild.id,
        miembroId,
        rol,
      );

      setGuild({ ...actualizado, inviteCode: guild.inviteCode });
    } catch (e) {
      setErrorAccion(
        obtenerMensajeError(e, "No fue posible cambiar el rol del miembro."),
      );
    }
  }

  function ascenderASenior(miembroId) {
    if (!puedeGestionarGremio || cantidadSenior >= MAX_SENIOR_ALCHEMISTS) {
      return;
    }

    cambiarRol(miembroId, "Senior Alchemist");
  }

  function bajarASenior(miembroId) {
    if (!puedeGestionarGremio) return;

    cambiarRol(miembroId, "Apprentice");
  }

  async function nombrarTaster(miembroId) {
    if (!puedeGestionarGremio) return;

    setErrorAccion("");

    try {
      const tasterActual = guild.members.find((m) => m.role === "Taster");

      if (tasterActual) {
        await guildService.cambiarRol(guild.id, tasterActual.id, "Apprentice");
      }

      const actualizado = await guildService.cambiarRol(
        guild.id,
        miembroId,
        "Taster",
      );

      setGuild({ ...actualizado, inviteCode: guild.inviteCode });
    } catch (e) {
      setErrorAccion(
        obtenerMensajeError(e, "No fue posible nombrar al Taster Oficial."),
      );
    }
  }

  function quitarTaster(miembroId) {
    if (!puedeGestionarGremio) return;

    cambiarRol(miembroId, "Apprentice");
  }

  function abrirEdicion() {
    setFormEdicion({
      name: guild.name,
      motto: guild.motto,
      emblem: guild.emblem,
      type: guild.type,
      inviteCode: guild.inviteCode || "",
    });
    setErrorAccion("");
    setEditando(true);
  }

  function cambiarCampoEdicion(campo, valor) {
    setFormEdicion((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    setErrorAccion("");

    try {
      const actualizado = await guildService.actualizar(guild.id, formEdicion);

      setGuild(actualizado);
      setEditando(false);
    } catch (error) {
      setErrorAccion(
        obtenerMensajeError(error, "No fue posible guardar los cambios."),
      );
    }
  }

  async function eliminarGremio() {
    const confirmar = window.confirm(
      "¿Eliminar este gremio y todas sus fórmulas? Esta acción no se puede deshacer.",
    );

    if (!confirmar) return;

    setErrorAccion("");

    try {
      await guildService.eliminar(guild.id);
      navigate("/gremios");
    } catch (e) {
      setErrorAccion(
        obtenerMensajeError(e, "No fue posible eliminar el gremio."),
      );
    }
  }

  async function crearFormula(nueva) {
    setErrorFormula("");

    try {
      const creada = await formulaService.crear({
        guildId: guild.id,
        name: nueva.name,
        effect: nueva.effect,
        difficulty: nueva.difficulty,
        endDate: nueva.endDate,
      });

      setFormulas((anteriores) => [creada, ...anteriores]);
      return true;
    } catch (e) {
      setErrorFormula(
        obtenerMensajeError(e, "No fue posible crear la fórmula."),
      );
      return false;
    }
  }

  async function eliminarFormula(formulaId) {
    const confirmar = window.confirm("¿Eliminar esta fórmula?");

    if (!confirmar) return;

    setErrorAccion("");

    try {
      await formulaService.eliminar(formulaId);
      setFormulas((anteriores) => anteriores.filter((f) => f.id !== formulaId));
    } catch (e) {
      setErrorAccion(
        obtenerMensajeError(e, "No fue posible eliminar la fórmula."),
      );
    }
  }

  if (cargando) {
    return (
      <>
        <NavBar />

        <main className="min-h-screen bg-app-bg p-8">
          <p className="text-app-muted" role="status">
            Cargando gremio...
          </p>
        </main>
      </>
    );
  }

  if (!cargado) {
    return (
      <>
        <NavBar />

        <main className="min-h-screen bg-app-bg p-8">
          <h1 className="text-3xl font-bold text-app-text">
            Gremio no encontrado
          </h1>

          {errorCarga && (
            <p className="text-red-500 mt-2" role="alert">
              {errorCarga}
            </p>
          )}

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

  const miMembresia = user
    ? guild.members.find((m) => m.id === user.id)
    : null;
  const miRol = miMembresia?.role;
  const yaEsMiembro = Boolean(miMembresia);
  const esGrandmaster = miRol === "Grandmaster";
  const esAdmin = user?.role === "admin";
  const puedeGestionarGremio = esGrandmaster || esAdmin;
  const puedeCrearFormula =
    miRol === "Grandmaster" || miRol === "Senior Alchemist" || esAdmin;
  const cantidadSenior = guild.members.filter(
    (m) => m.role === "Senior Alchemist",
  ).length;

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-app-bg p-8">
        <section className="max-w-4xl mx-auto">
          <Link to="/gremios" className="text-purple-accent hover:underline">
            ← Volver a gremios
          </Link>

          <Card className="p-6 mt-6">
            <div className="text-5xl mb-4">{guild.emblem}</div>

            <h1 className="text-3xl font-bold text-app-text">{guild.name}</h1>

            <p className="text-app-muted mt-2">{guild.motto}</p>

            <p className="text-sm text-purple-accent mt-4">
              {guild.type === "Private" ? "Privado" : "Público"}
            </p>

            {puedeGestionarGremio && guild.type === "Private" && (
              <p className="text-sm text-app-muted mt-2">
                Código de invitación:{" "}
                <strong className="text-app-text">
                  {guild.inviteCode || "no disponible"}
                </strong>
              </p>
            )}

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
                      Como Grandmaster, no puedes abandonar el gremio mientras
                      seas su propietario.
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
                    maxLength={20}
                    className="p-2.5 rounded-button border border-app-border bg-app-surface text-app-text"
                  />

                  <Button type="submit">Unirse con código</Button>
                </form>
              ) : (
                <Button onClick={unirseAlGremio}>Unirse al gremio</Button>
              )}

              {joinError && (
                <p className="text-red-500 text-sm mt-2" role="alert">
                  {joinError}
                </p>
              )}
            </div>

            {puedeGestionarGremio && !editando && (
              <div className="flex flex-wrap gap-2 mt-6">
                <button
                  type="button"
                  onClick={abrirEdicion}
                  className="text-sm px-4 py-2 rounded-button border border-app-border text-app-text hover:bg-app-surface transition"
                >
                  Editar gremio
                </button>

                <button
                  type="button"
                  onClick={eliminarGremio}
                  className="text-sm px-4 py-2 rounded-button border border-red-500 text-red-400 font-semibold hover:bg-red-500/10 transition"
                >
                  Eliminar gremio
                </button>
              </div>
            )}
          </Card>

          {editando && (
            <Card className="p-6 mt-6">
              <h2 className="text-2xl font-bold text-app-text mb-4">
                Editar gremio
              </h2>

              <form onSubmit={guardarEdicion} className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-sm text-app-muted mb-1"
                  >
                    Nombre
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={formEdicion.name}
                    onChange={(e) => cambiarCampoEdicion("name", e.target.value)}
                    className={CLASE_INPUT}
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-motto"
                    className="block text-sm text-app-muted mb-1"
                  >
                    Lema
                  </label>
                  <input
                    id="edit-motto"
                    type="text"
                    value={formEdicion.motto}
                    onChange={(e) =>
                      cambiarCampoEdicion("motto", e.target.value)
                    }
                    className={CLASE_INPUT}
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-emblem"
                    className="block text-sm text-app-muted mb-1"
                  >
                    Emblema
                  </label>
                  <input
                    id="edit-emblem"
                    type="text"
                    value={formEdicion.emblem}
                    onChange={(e) =>
                      cambiarCampoEdicion("emblem", e.target.value)
                    }
                    className={CLASE_INPUT}
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-type"
                    className="block text-sm text-app-muted mb-1"
                  >
                    Tipo
                  </label>
                  <select
                    id="edit-type"
                    value={formEdicion.type}
                    onChange={(e) => cambiarCampoEdicion("type", e.target.value)}
                    className={CLASE_INPUT}
                  >
                    <option value="Public">Público</option>
                    <option value="Private">Privado</option>
                  </select>
                </div>

                {formEdicion.type === "Private" && (
                  <div>
                    <label
                      htmlFor="edit-invite"
                      className="block text-sm text-app-muted mb-1"
                    >
                      Código de invitación
                    </label>
                    <input
                      id="edit-invite"
                      type="text"
                      value={formEdicion.inviteCode}
                      onChange={(e) =>
                        cambiarCampoEdicion("inviteCode", e.target.value)
                      }
                      className={CLASE_INPUT}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button type="submit">Guardar cambios</Button>

                  <button
                    type="button"
                    onClick={() => setEditando(false)}
                    className="px-4 py-2 rounded-button border border-app-border text-app-text hover:bg-app-surface transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </Card>
          )}

          {errorAccion && (
            <p className="text-red-500 text-sm mt-4" role="alert">
              {errorAccion}
            </p>
          )}

          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-4">Miembros</h2>

            <p className="text-sm text-app-muted mb-4">
              Senior Alchemists: {cantidadSenior}/{MAX_SENIOR_ALCHEMISTS} ·{" "}
              Taster Oficial:{" "}
              {guild.members.some((m) => m.role === "Taster")
                ? "asignado"
                : "sin asignar"}
            </p>

            {guild.members.length > 0 ? (
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

                    {puedeGestionarGremio && member.role !== "Grandmaster" && (
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

          <FormulaForm
            onCreateFormula={crearFormula}
            canCreate={puedeCrearFormula}
          />

          {errorFormula && (
            <p className="text-red-500 text-sm mb-4" role="alert">
              {errorFormula}
            </p>
          )}

          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-4">Fórmulas</h2>

            {errorFormulas ? (
              <p className="text-app-muted" role="alert">
                {errorFormulas}
              </p>
            ) : formulas.length === 0 ? (
              <p className="text-app-muted">
                Este gremio todavía no tiene fórmulas.
              </p>
            ) : (
              <div className="space-y-4">
                {formulas.map((formula) => (
                  <div key={formula.id}>
                    <FormulaCard formula={formula} />

                    {(formula.createdBy === user?.id ||
                      puedeGestionarGremio) && (
                      <button
                        type="button"
                        onClick={() => eliminarFormula(formula.id)}
                        className="mt-2 text-sm px-3 py-1.5 rounded-button border border-red-500 text-red-400 hover:bg-red-500/10 transition"
                      >
                        Eliminar fórmula
                      </button>
                    )}
                  </div>
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

            <GuildRanking members={guild.members} formulas={formulas} />
          </Card>
        </section>
      </main>
    </>
  );
}

export default GuildDetail;
