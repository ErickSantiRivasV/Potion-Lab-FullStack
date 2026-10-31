import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";
import Button from "../components/buttons/Button";
import CategoriaVotacion from "../components/CategoriaVotacion";
import { AuthContext } from "../context/AuthContext";
import formulasIniciales from "../data/formulas";
import guildsIniciales from "../data/guilds";

function estadoTexto(state) {
  const textos = {
    Proposal: "Propuesta",
    VotingOpen: "Votación abierta",
    Closed: "Cerrada",
    Distilled: "Destilada",
  };

  return textos[state] || state;
}

// Calcula el peso del voto de un miembro en una categoría específica
function pesoDeVoto(member, categoryKey) {
  let peso = 1;

  if (member.specialty === "Brewmaster") {
    peso *= 1.2;
  } else if (
    (categoryKey === "ingredient" && member.specialty === "Herbalist") ||
    (categoryKey === "method" && member.specialty === "Runist") ||
    (categoryKey === "flask" && member.specialty === "Taster")
  ) {
    peso *= 1.2;
  }

  // Taster Oficial del gremio: voto doble en todas las categorías
  if (member.role === "Taster") {
    peso *= 2;
  }

  return peso;
}
function valorDificultad(difficulty) {
  const valores = {
    Easy: 1,
    Medium: 2,
    Hard: 3,
    Arcane: 4,
  };

  return valores[difficulty] || 1;
}

function FormulaDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [formula, setFormula] = useState(null);
  const [guild, setGuild] = useState(null);
  const [vetoCategoria, setVetoCategoria] = useState("ingredient");
  const [vetoOpcion, setVetoOpcion] = useState("");

  useEffect(() => {
    const guardadas = localStorage.getItem("formulas");

    if (guardadas) {
      const formulas = JSON.parse(guardadas);

      const encontrada = formulas.find(
        (formula) => formula.id === Number(id),
      );

      if (encontrada) {
        setFormula(encontrada);
      } else {
        const encontradaInicial = formulasIniciales.find(
          (formula) => formula.id === Number(id),
        );

        setFormula(encontradaInicial || null);
      }
    } else {
      const encontrada = formulasIniciales.find(
        (formula) => formula.id === Number(id),
      );

      setFormula(encontrada || null);
    }
  }, [id]);

  useEffect(() => {
    if (!formula) return;

    const guardados = localStorage.getItem("guilds");
    const listaGuilds = guardados ? JSON.parse(guardados) : guildsIniciales;

    const guildEncontrado = listaGuilds.find(
      (g) => g.id === formula.guildId,
    );

    setGuild(guildEncontrado || null);
  }, [formula]);

  useEffect(() => {
    if (!formula || formula.state !== "VotingOpen") return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaLimite = new Date(formula.endDate);

    if (fechaLimite <= hoy) {
      actualizarFormula(
        registrarTransicion(formula, "Closed", "Sistema (cierre automático)"),
      );
    }
  }, [formula]);

  // Mantiene la opción del veto siempre válida para la categoría elegida
  useEffect(() => {
    if (!formula) return;

    const opciones = formula.categories[vetoCategoria]?.options || [];

    if (!opciones.includes(vetoOpcion)) {
      setVetoOpcion(opciones[0] || "");
    }
  }, [vetoCategoria, formula]);

  function actualizarFormula(formulaActualizada) {
    const guardadas = localStorage.getItem("formulas");
    const lista = guardadas ? JSON.parse(guardadas) : formulasIniciales;

    const listaActualizada = lista.map((f) =>
      f.id === formulaActualizada.id ? formulaActualizada : f,
    );

    localStorage.setItem("formulas", JSON.stringify(listaActualizada));
    setFormula(formulaActualizada);
  }

  function registrarTransicion(formulaBase, nuevoEstado, changedBy) {
    const entrada = {
      state: nuevoEstado,
      changedAt: new Date().toISOString(),
      changedBy: changedBy,
    };

    return {
      ...formulaBase,
      state: nuevoEstado,
      stateHistory: [...(formulaBase.stateHistory || []), entrada],
    };
  }

  function abrirVotacion() {
    if (!puedeGestionarEstado || formula.state !== "Proposal") return;
    actualizarFormula(registrarTransicion(formula, "VotingOpen", user.name));
  }

  function cerrarVotacionManual() {
    if (!puedeGestionarEstado || formula.state !== "VotingOpen") return;
    actualizarFormula(registrarTransicion(formula, "Closed", user.name));
  }

  function votar(categoria, opcion) {
    if (!puedeVotar) return;

    const votosCategoria = {
      ...(formula.votes?.[categoria] || {}),
      [user.id]: opcion,
    };

    const votosActualizados = {
      ...formula.votes,
      [categoria]: votosCategoria,
    };

    actualizarFormula({ ...formula, votes: votosActualizados });
  }

  // Suma los pesos de voto por opción dentro de una categoría
  function calcularResultadosCategoria(categoryKey) {
    const votosCategoria = formula.votes?.[categoryKey] || {};
    const resultados = {};

    Object.entries(votosCategoria).forEach(([userId, opcion]) => {
      const member = guild?.members.find(
        (m) => String(m.id) === String(userId),
      );

      if (!member) return;

      const peso = pesoDeVoto(member, categoryKey);

      if (!resultados[opcion]) {
        resultados[opcion] = { conteo: 0, peso: 0 };
      }

      resultados[opcion].conteo += 1;
      resultados[opcion].peso += peso;
    });

    return resultados;
  }

  // Desempate: Taster Oficial decide -> Grandmaster decide -> aleatorio
  function desempatar(categoryKey, opcionA, opcionB) {
    const votosCategoria = formula.votes?.[categoryKey] || {};

    const taster = guild.members.find((m) => m.role === "Taster");
    if (taster && votosCategoria[taster.id]) {
      return votosCategoria[taster.id];
    }

    const grandmaster = guild.members.find((m) => m.role === "Grandmaster");
    if (grandmaster && votosCategoria[grandmaster.id]) {
      return votosCategoria[grandmaster.id];
    }

    return Math.random() < 0.5 ? opcionA : opcionB;
  }

  function elegirGanador(categoryKey, opciones, resultados) {
    // El veto del Taster, si se usó en esta categoría, manda directamente
    if (formula.vetoDetails && formula.vetoDetails.category === categoryKey) {
      return formula.vetoDetails.chosenOption;
    }

    const [opcionA, opcionB] = opciones;
    const pesoA = resultados[opcionA]?.peso || 0;
    const pesoB = resultados[opcionB]?.peso || 0;

    if (pesoA > pesoB) return opcionA;
    if (pesoB > pesoA) return opcionB;

    return desempatar(categoryKey, opcionA, opcionB);
  }

  function handleVetoSubmit(e) {
    e.preventDefault();

    if (miRol !== "Taster" || formula.vetoUsed || !vetoOpcion) return;

    actualizarFormula({
      ...formula,
      vetoUsed: true,
      vetoDetails: {
        category: vetoCategoria,
        chosenOption: vetoOpcion,
        by: user.name,
      },
    });
  }

  // Cierra el ciclo: calcula ganadores, dificultad real y rareza
  function destilarPocion() {
    if (!puedeGestionarEstado || formula.state !== "Closed") return;

    const resultadosIngrediente = calcularResultadosCategoria("ingredient");
    const resultadosMetodo = calcularResultadosCategoria("method");
    const resultadosFrasco = calcularResultadosCategoria("flask");

    const ganadorIngrediente = elegirGanador(
      "ingredient",
      formula.categories.ingredient.options,
      resultadosIngrediente,
    );

    const ganadorMetodo = elegirGanador(
      "method",
      formula.categories.method.options,
      resultadosMetodo,
    );

    const ganadorFrasco = elegirGanador(
      "flask",
      formula.categories.flask.options,
      resultadosFrasco,
    );

    const pesoIngrediente = resultadosIngrediente[ganadorIngrediente]?.peso || 0;
    const pesoMetodo = resultadosMetodo[ganadorMetodo]?.peso || 0;

    const dificultadBase = valorDificultad(formula.difficulty);

    const dificultadReal =
        dificultadBase + pesoIngrediente + pesoMetodo;

    const rareza =
        dificultadReal * 10 +
        pesoIngrediente * 3 +
        pesoMetodo * 2;   

    const pocionFinal = {
      finalName: `${ganadorIngrediente} + ${ganadorMetodo} en ${ganadorFrasco}`,
      realDifficulty: Number(dificultadReal.toFixed(2)),
      rarity: Number(rareza.toFixed(2)),
      winners: {
        ingredient: ganadorIngrediente,
        method: ganadorMetodo,
        flask: ganadorFrasco,
      },
    };

    actualizarFormula({
      ...registrarTransicion(formula, "Distilled", user.name),
      finalPotion: pocionFinal,
    });
  }

  if (formula === null) {
    return (
      <>
        <NavBar />

        <main className="min-h-screen bg-app-bg p-8">
          <h1 className="text-3xl font-bold text-app-text">
            Fórmula no encontrada
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

  const miRol = user && guild
    ? guild.members.find((m) => m.id === user.id)?.role
    : undefined;

  const puedeGestionarEstado =
    miRol === "Grandmaster" || miRol === "Senior Alchemist";

  const puedeVotar =
    Boolean(user) && Boolean(miRol) && formula.state === "VotingOpen";

  const votes = formula.votes || { ingredient: {}, method: {}, flask: {} };

  const resultadosIngrediente = guild
    ? calcularResultadosCategoria("ingredient")
    : {};
  const resultadosMetodo = guild ? calcularResultadosCategoria("method") : {};
  const resultadosFrasco = guild ? calcularResultadosCategoria("flask") : {};

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
            <h1 className="text-3xl font-bold text-app-text">
              {formula.name}
            </h1>

            <p className="text-app-muted mt-3">
              {formula.effect}
            </p>

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
                {formula.difficulty}
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
              <Button onClick={abrirVotacion} className="mt-4">
                Abrir votación
              </Button>
            )}

            {puedeGestionarEstado && formula.state === "VotingOpen" && (
              <Button onClick={cerrarVotacionManual} className="mt-4">
                Cerrar votación ahora
              </Button>
            )}

            {formula.state === "Closed" && (
              <>
                {puedeGestionarEstado && (
                  <Button onClick={destilarPocion} className="mt-4">
                    Destilar poción
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
                        <option value="ingredient">
                          {formula.categories.ingredient.name}
                        </option>
                        <option value="method">
                          {formula.categories.method.name}
                        </option>
                        <option value="flask">
                          {formula.categories.flask.name}
                        </option>
                      </select>

                      <label className="sr-only" htmlFor="veto-opcion">
                        Opción
                      </label>

                      <select
                        id="veto-opcion"
                        value={vetoOpcion}
                        onChange={(e) => setVetoOpcion(e.target.value)}
                        className="p-2.5 rounded-button border border-app-border bg-app-surface text-app-text"
                      >
                        {(formula.categories[vetoCategoria]?.options || []).map(
                          (opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ),
                        )}
                      </select>

                      <Button type="submit">
                        Usar veto
                      </Button>
                    </div>
                  </form>
                )}

                {formula.vetoUsed && (
                  <p className="text-sm text-app-muted mt-3">
                    Veto usado por {formula.vetoDetails.by}:{" "}
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
              user &&
              (formula.state === "Proposal" ||
                formula.state === "VotingOpen") && (
                <p className="text-sm text-app-muted mt-4">
                  Solo el Grandmaster o los Senior Alchemist de este gremio
                  pueden cambiar el estado de esta fórmula.
                </p>
              )}

            {formula.stateHistory && formula.stateHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-app-text mb-2">
                  Historial de estados
                </h3>

                <ol className="space-y-1 text-sm text-app-muted">
                  {formula.stateHistory.map((entrada, index) => (
                    <li key={index}>
                      {estadoTexto(entrada.state)} —{" "}
                      {new Date(entrada.changedAt).toLocaleString()} (
                      {entrada.changedBy})
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
              <CategoriaVotacion
                titulo={formula.categories.ingredient.name}
                opciones={formula.categories.ingredient.options}
                resultados={resultadosIngrediente}
                miVotoActual={user ? votes.ingredient?.[user.id] : undefined}
                puedeVotar={puedeVotar}
                onVotar={(opcion) => votar("ingredient", opcion)}
              />

              <CategoriaVotacion
                titulo={formula.categories.method.name}
                opciones={formula.categories.method.options}
                resultados={resultadosMetodo}
                miVotoActual={user ? votes.method?.[user.id] : undefined}
                puedeVotar={puedeVotar}
                onVotar={(opcion) => votar("method", opcion)}
              />

              <CategoriaVotacion
                titulo={formula.categories.flask.name}
                opciones={formula.categories.flask.options}
                resultados={resultadosFrasco}
                miVotoActual={user ? votes.flask?.[user.id] : undefined}
                puedeVotar={puedeVotar}
                onVotar={(opcion) => votar("flask", opcion)}
              />
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}

export default FormulaDetail;