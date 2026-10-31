// Toma las últimas 5 fórmulas que ya salieron de "Proposal"
// (o sea que sí se pudo votar en ellas) para medir participación
function ultimasFormulasVotables(formulas) {
  return formulas
    .filter((f) => f.state !== "Proposal")
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
}

function calcularParticipacion(member, formulasRecientes) {
  if (formulasRecientes.length === 0) return null;

  const participadas = formulasRecientes.filter((f) =>
    ["ingredient", "method", "flask"].some(
      (categoria) => f.votes?.[categoria]?.[member.id] !== undefined,
    ),
  ).length;

  return {
    porcentaje: Math.round((participadas / formulasRecientes.length) * 100),
    consideradas: formulasRecientes.length,
  };
}

function calcularPuntos(member, formulas) {
  const propias = formulas.filter((f) => f.createdBy === member.id);
  const distiladas = propias.filter((f) => f.state === "Distilled");

  const puntos = propias.length * 10 + distiladas.length * 20;

  const rarezaTotal = distiladas.reduce(
    (suma, f) => suma + (f.finalPotion?.rarity || 0),
    0,
  );

  return { puntos, rarezaTotal };
}

// Solo tiene sentido para quien es (o fue) Taster Oficial:
// de todo lo que votó en fórmulas ya destiladas, ¿cuánto coincidió con el ganador?
function calcularAciertoTaster(member, formulas) {
  if (member.role !== "Taster") return null;

  let totalVotos = 0;
  let aciertos = 0;

  formulas
    .filter((f) => f.state === "Distilled" && f.finalPotion)
    .forEach((f) => {
      ["ingredient", "method", "flask"].forEach((categoria) => {
        const voto = f.votes?.[categoria]?.[member.id];

        if (voto !== undefined) {
          totalVotos += 1;

          if (voto === f.finalPotion.winners[categoria]) {
            aciertos += 1;
          }
        }
      });
    });

  if (totalVotos === 0) return null;

  return Math.round((aciertos / totalVotos) * 100);
}

function GuildRanking({ members, formulas }) {
  const formulasRecientes = ultimasFormulasVotables(formulas);

  const filas = members.map((member) => {
    const { puntos, rarezaTotal } = calcularPuntos(member, formulas);
    const participacion = calcularParticipacion(member, formulasRecientes);
    const acierto = calcularAciertoTaster(member, formulas);

    const restringido =
      member.restrictedUntil &&
      new Date(member.restrictedUntil) > new Date();

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      puntos,
      rarezaTotal,
      participacion,
      acierto,
      restringido,
    };
  });

  // De mayor a menor puntaje de alquimia
  filas.sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-app-muted border-b border-app-border">
            <th className="py-2 pr-4 font-semibold">Alquimista</th>
            <th className="py-2 pr-4 font-semibold">Puntos</th>
            <th className="py-2 pr-4 font-semibold">Rareza total</th>
            <th className="py-2 pr-4 font-semibold">Participación</th>
            <th className="py-2 pr-4 font-semibold">Acierto Taster</th>
          </tr>
        </thead>

        <tbody>
          {filas.map((fila) => (
            <tr key={fila.id} className="border-b border-app-border">
              <td className="py-2 pr-4 text-app-text font-semibold align-top">
                {fila.name}

                {fila.restringido && (
                  <span className="block text-xs text-red-400 mt-1">
                    Sin poder crear fórmulas (baja participación)
                  </span>
                )}
              </td>

              <td className="py-2 pr-4 text-app-text align-top">
                {fila.puntos}
              </td>

              <td className="py-2 pr-4 text-app-text align-top">
                {fila.rarezaTotal.toFixed(1)}
              </td>

              <td className="py-2 pr-4 text-app-text align-top">
                {fila.participacion
                  ? `${fila.participacion.porcentaje}% (${fila.participacion.consideradas} fórmulas)`
                  : "Sin datos"}
              </td>

              <td className="py-2 pr-4 text-app-text align-top">
                {fila.acierto !== null ? `${fila.acierto}%` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GuildRanking;
