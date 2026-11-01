import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";
import Button from "../components/buttons/Button";
import CategoriaVotacion from "../components/CategoriaVotacion";
import { AuthContext } from "../context/AuthContext";
import { formulaService } from "../services/formulaService";
import { guildService } from "../services/guildService";
import { CATEGORIAS } from "../utils/mappers";
import { obtenerMensajeError } from "../utils/errores";

const CLASE_INPUT =
  "w-full p-2.5 rounded-button border border-app-border bg-app-surface text-app-text";

const DIFICULTADES = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Arcane" };

const FORMULA_INICIAL = {
  id: "",
  guildId: "",
  guildName: "",
  name: "",
  effect: "",
  difficulty: 1,
  state: "Proposal",
  endDate: "",
  createdBy: "",
  createdByName: "",
  stateHistory: [],
  votes: { ingredient: {}, method: {}, flask: {} },
  categories: CATEGORIAS,
  vetoUsed: false,
  vetoDetails: null,
  finalPotion: null,
};

const GUILD_INICIAL = {
  id: "",
  name: "",
  motto: "",
  type: "Public",
  emblem: "",
  inviteCode: null,
  createdBy: "",
  members: [],
};

function estadoTexto(state) {
  const textos = {
    Proposal: "Propuesta",
    VotingOpen: "Votación abierta",
    Closed: "Cerrada",
    Distilled: "Destilada",
  };

  return textos[state] || state;
}

function textoDificultad(valor) {
  return DIFICULTADES[valor] ? `${DIFICULTADES[valor]} (${valor})` : valor;
}

function aFechaInput(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function contarVotos(votosCategoria) {
  const conteo = {};

  Object.values(votosCategoria || {}).forEach((opcion) => {
    conteo[opcion] = (conteo[opcion] || 0) + 1;
  });

  return conteo;
}

function FormulaDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formula, setFormula] = useState(FORMULA_INICIAL);
  const [guild, setGuild] = useState(GUILD_INICIAL);
  const [cargado, setCargado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [vetoCategoria, setVetoCategoria] = useState("ingredient");
  const [vetoOpcion, setVetoOpcion] = useState("");
  const [editando, setEditando] = useState(false);
  const [formEdicion, setFormEdicion] = useState({
    name: "",
    effect: "",
    difficulty: "1",
    endDate: "",
  });

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const encontrada = await formulaService.obtener(id);
        const gremio = await guildService.obtener(encontrada.guildId);

        if (activo) {
          setFormula(encontrada);
          setGuild(gremio);
          setCargado(true);
        }
      } catch (e) {
        if (activo) {
          setErrorCarga(
            obtenerMensajeError(e, "No fue posible cargar la fórmula."),
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [id]);

  async function ejecutarAccion(accion, mensajeError) {
    setErrorAccion("");
    setProcesando(true);

    try {
      const actualizada = await accion();
      setFormula(actualizada);
      return true;
    } catch (e) {
      setErrorAccion(obtenerMensajeError(e, mensajeError));
      return false;
    } finally {
      setProcesando(false);
    }
  }

  function cambiarEstado(nuevoEstado) {
    return ejecutarAccion(
      () => formulaService.cambiarEstado(formula.id, nuevoEstado),
      "No fue posible cambiar el estado de la fórmula.",
    );
  }

  function votar(categoria, opcion) {
    if (!puedeVotar) return;

    return ejecutarAccion(
      () => formulaService.votar(formula.id, categoria, opcion),
      "No fue posible registrar tu voto.",
    );
  }

  function handleVetoSubmit(e) {
    e.preventDefault();

    if (miRol !== "Taster" || formula.vetoUsed || !opcionVetoEfectiva) return;

    ejecutarAccion(
      () =>
        formulaService.usarVeto(
          formula.id,
          vetoCategoria,
          opcionVetoEfectiva,
        ),
      "No fue posible usar el veto.",
    );
  }

  function abrirEdicion() {
    setErrorAccion("");
    setFormEdicion({
      name: formula.name,
      effect: formula.effect,
      difficulty: String(formula.difficulty),
      endDate: formula.endDate,
    });
    setEditando(true);
  }

  async function guardarEdicion(e) {
    e.preventDefault();

    const nombre = formEdicion.name.trim();
    const efecto = formEdicion.effect.trim();

    if (nombre.length < 3 || nombre.length > 80) {
      setErrorAccion("El nombre debe tener entre 3 y 80 caracteres.");
      return;
    }

    if (efecto.length < 5 || efecto.length > 300) {
      setErrorAccion("El efecto debe tener entre 5 y 300 caracteres.");
      return;
    }

    if (formEdicion.endDate === "") {
      setErrorAccion("La fecha límite es obligatoria.");
      return;
    }

    const exito = await ejecutarAccion(
      () =>
        formulaService.actualizar(formula.id, {
          name: nombre,
          effect: efecto,
          difficulty: Number(formEdicion.difficulty),
          endDate: formEdicion.endDate,
        }),
      "No fue posible actualizar la fórmula.",
    );

    if (exito) setEditando(false);
  }

  async function eliminarFormula() {
    const confirmar = window.confirm("¿Eliminar esta fórmula?");

    if (!confirmar) return;

    setErrorAccion("");
    setProcesando(true);

    try {
      await formulaService.eliminar(formula.id);
      navigate(`/gremio/${formula.guildId}`);
    } catch (e) {
      setErrorAccion(
        obtenerMensajeError(e, "No fue posible eliminar la fórmula."),
      );
      setProcesando(false);
    }
  }

  if (cargando) {
    return (
      <>
        <NavBar />

        <main className="min-h-screen bg-app-bg p-8">
          <p className="text-app-muted" role="status">
            Cargando fórmula...
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
            Fórmula no encontrada
          </h1>

          {errorCarga && (
            <p className="text-red-500 mt-3" role="alert">
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

  const esAdmin = user?.role === "admin";
  const miRol = user
    ? guild.members.find((m) => m.id === user.id)?.role
    : undefined;
  const esCreador = Boolean(user) && formula.createdBy === user.id;
  const esGrandmaster = miRol === "Grandmaster";

  const puedeGestionarEstado =
    esAdmin || esCreador || esGrandmaster || miRol === "Senior Alchemist";
  const puedeVotar = Boolean(miRol) && formula.state === "VotingOpen";
  const puedeEditar =
    formula.state === "Proposal" && (esAdmin || esCreador || esGrandmaster);
  const puedeEliminar = esAdmin || esCreador || esGrandmaster;

  const opcionesVeto = formula.categories[vetoCategoria].options;
  const opcionVetoEfectiva = opcionesVeto.includes(vetoOpcion)
    ? vetoOpcion
    : opcionesVeto[0];

  const opcionesDificultad = Object.keys(DIFICULTADES);
  if (!opcionesDificultad.includes(formEdicion.difficulty)) {
    opcionesDificultad.push(formEdicion.difficulty);
  }

  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const fechaMaxima = new Date(hoy);
  fechaMaxima.setDate(fechaMaxima.getDate() + 7);

  const categoriasVotables = ["ingredient", "method", "flask"];

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-app-bg p-8">
        <section className="max-w-4xl mx-auto">
          <Link
            to={`/gremio/${formula.guildId}`}
            className="text-purple-accent hover:underline"
          >
            ← Volver al gremio {formula.guildName}
          </Link>

          {errorAccion && (
            <p className="text-red-500 text-sm mt-4" role="alert">
              {errorAccion}
            </p>
          )}

          <Card className="p-6 mt-6">
            {editando ? (
              <form onSubmit={guardarEdicion} className="space-y-4">
                <h2 className="text-2xl font-bold text-app-text">
                  Editar fórmula
                </h2>

                <div>
                  <label
                    htmlFor="editar-nombre"
                    className="block text-app-text font-semibold mb-1"
                  >
                    Nombre
                  </label>
                  <input
                    id="editar-nombre"
                    type="text"
                    maxLength={80}
                    value={formEdicion.name}
                    onChange={(e) =>
                      setFormEdicion({ ...formEdicion, name: e.target.value })
                    }
                    className={CLASE_INPUT}
                  />
                </div>

                <div>
                  <label
                    htmlFor="editar-efecto"
                    className="block text-app-text font-semibold mb-1"
                  >
                    Efecto
                  </label>
                  <textarea
                    id="editar-efecto"
                    maxLength={300}
                    value={formEdicion.effect}
                    onChange={(e) =>
                      setFormEdicion({ ...formEdicion, effect: e.target.value })
                    }
                    className={`${CLASE_INPUT} min-h-24`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="editar-dificultad"
                    className="block text-app-text font-semibold mb-1"
                  >
                    Dificultad
                  </label>
                  <select
                    id="editar-dificultad"
                    value={formEdicion.difficulty}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        difficulty: e.target.value,
                      })
                    }
                    className={CLASE_INPUT}
                  >
                    {opcionesDificultad.map((valor) => (
                      <option key={valor} value={valor}>
                        {DIFICULTADES[valor] || valor}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="editar-fecha"
                    className="block text-app-text font-semibold mb-1"
                  >
                    Fecha límite de votación
                  </label>
                  <input
                    id="editar-fecha"
                    type="date"
                    min={aFechaInput(manana)}
                    max={aFechaInput(fechaMaxima)}
                    value={formEdicion.endDate}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        endDate: e.target.value,
                      })
                    }
                    className={CLASE_INPUT}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={procesando}>
                    {procesando ? "Guardando..." : "Guardar cambios"}
                  </Button>

                  <Button
                    onClick={() => setEditando(false)}
                    disabled={procesando}
                    className="bg-app-surface text-app-text border border-app-border"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-app-text">
                  {formula.name}
                </h1>

                <p className="text-app-muted mt-3">{formula.effect}</p>

                <p className="text-app-muted mt-2">
                  Propuesta por:{" "}
                  <span className="text-app-text font-semibold">
                    {formula.createdByName || "Alquimista desconocido"}
                  </span>
                </p>

                <div className="mt-6 space-y-2">
                  <p className="text-app-muted">
                    <span className="font-semibold text-app-text">
                      Dificultad:
                    </span>{" "}
                    {textoDificultad(formula.difficulty)}
                  </p>

                  <p className="text-app-muted">
                    <span className="font-semibold text-app-text">
                      Estado:
                    </span>{" "}
                    {estadoTexto(formula.state)}
                  </p>

                  <p className="text-app-muted">
                    <span className="font-semibold text-app-text">
                      Fecha límite:
                    </span>{" "}
                    {formula.endDate}
                  </p>
                </div>

                {(puedeEditar || puedeEliminar) && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {puedeEditar && (
                      <Button onClick={abrirEdicion} disabled={procesando}>
                        Editar fórmula
                      </Button>
                    )}

                    {puedeEliminar && (
                      <button
                        type="button"
                        onClick={eliminarFormula}
                        disabled={procesando}
                        className="px-5 py-2.5 rounded-button border border-red-500 text-red-500 font-semibold hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Eliminar fórmula
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>

          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-4">
              Estado de la fórmula
            </h2>

            <p className="text-app-muted">
              Estado actual:{" "}
              <span className="text-purple-accent font-semibold">
                {estadoTexto(formula.state)}
              </span>
            </p>

            {puedeGestionarEstado && formula.state === "Proposal" && (
              <Button
                onClick={() => cambiarEstado("VotingOpen")}
                disabled={procesando}
                className="mt-4"
              >
                {procesando ? "Procesando..." : "Abrir votación"}
              </Button>
            )}

            {puedeGestionarEstado && formula.state === "VotingOpen" && (
              <Button
                onClick={() => cambiarEstado("Closed")}
                disabled={procesando}
                className="mt-4"
              >
                {procesando ? "Procesando..." : "Cerrar votación ahora"}
              </Button>
            )}

            {formula.state === "Closed" && (
              <>
                {puedeGestionarEstado && (
                  <Button
                    onClick={() => cambiarEstado("Distilled")}
                    disabled={procesando}
                    className="mt-4"
                  >
                    {procesando ? "Destilando..." : "Destilar poción"}
                  </Button>
                )}

                {miRol === "Taster" && !formula.vetoUsed && (
                  <form
                    onSubmit={handleVetoSubmit}
                    className="mt-4 space-y-3 p-4 rounded-button border border-app-border bg-app-bg"
                  >
                    <p className="text-sm text-app-text font-semibold">
                      Como Taster Oficial puedes usar tu veto una vez por
                      fórmula para forzar el resultado de una categoría.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <label className="sr-only" htmlFor="veto-categoria">
                        Categoría
                      </label>

                      <select
                        id="veto-categoria"
                        value={vetoCategoria}
                        onChange={(e) => setVetoCategoria(e.target.value)}
                        className="p-2.5 rounded-button border border-app-border bg-app-surface text-app-text"
                      >
                        {categoriasVotables.map((clave) => (
                          <option key={clave} value={clave}>
                            {formula.categories[clave].name}
                          </option>
                        ))}
                      </select>

                      <label className="sr-only" htmlFor="veto-opcion">
                        Opción
                      </label>

                      <select
                        id="veto-opcion"
                        value={opcionVetoEfectiva}
                        onChange={(e) => setVetoOpcion(e.target.value)}
                        className="p-2.5 rounded-button border border-app-border bg-app-surface text-app-text"
                      >
                        {opcionesVeto.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>

                      <Button type="submit" disabled={procesando}>
                        Usar veto
                      </Button>
                    </div>
                  </form>
                )}

                {formula.vetoUsed && formula.vetoDetails && (
                  <p className="text-sm text-app-muted mt-3">
                    Veto usado por {formula.vetoDetails.by || "el Taster"}:{" "}
                    {formula.categories[formula.vetoDetails.category].name} →{" "}
                    {formula.vetoDetails.chosenOption}
                  </p>
                )}
              </>
            )}

            {formula.state === "Distilled" && formula.finalPotion && (
              <div className="mt-4 space-y-1">
                <p className="text-app-text font-semibold">
                  {formula.finalPotion.finalName}
                </p>

                <p className="text-sm text-app-muted">
                  Dificultad real: {formula.finalPotion.realDifficulty} ·
                  Rareza: {formula.finalPotion.rarity}
                </p>
              </div>
            )}

            {!puedeGestionarEstado &&
              (formula.state === "Proposal" ||
                formula.state === "VotingOpen") && (
                <p className="text-sm text-app-muted mt-4">
                  Solo el creador, el Grandmaster o los Senior Alchemist de
                  este gremio pueden cambiar el estado de esta fórmula.
                </p>
              )}

            {formula.stateHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-app-text mb-2">
                  Historial de estados
                </h3>

                <ol className="space-y-1 text-sm text-app-muted">
                  {formula.stateHistory.map((entrada, index) => (
                    <li key={index}>
                      {estadoTexto(entrada.state)} —{" "}
                      {new Date(entrada.changedAt).toLocaleString()} (
                      {entrada.changedBy || "Sistema"})
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>

          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-4">
              Categorías de votación
            </h2>

            <div className="space-y-4">
              {categoriasVotables.map((clave) => (
                <CategoriaVotacion
                  key={clave}
                  titulo={formula.categories[clave].name}
                  opciones={formula.categories[clave].options}
                  resultados={contarVotos(formula.votes[clave])}
                  miVotoActual={user ? formula.votes[clave][user.id] : undefined}
                  puedeVotar={puedeVotar}
                  enviando={procesando}
                  onVotar={(opcion) => votar(clave, opcion)}
                />
              ))}
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}

export default FormulaDetail;
