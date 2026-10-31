function CategoriaVotacion({
  titulo,
  opciones,
  resultados,
  miVotoActual,
  puedeVotar,
  onVotar,
}) {
  const totalPeso = opciones.reduce(
    (suma, opcion) => suma + (resultados[opcion]?.peso || 0),
    0,
  );

  return (
    <fieldset className="p-4 rounded-button bg-app-bg border border-app-border">
      <legend className="font-semibold text-app-text px-1">
        {titulo}
      </legend>

      <div className="space-y-3 mt-2">
        {opciones.map((opcion) => {
          const datos = resultados[opcion] || { conteo: 0, peso: 0 };

          const porcentaje =
            totalPeso > 0 ? Math.round((datos.peso / totalPeso) * 100) : 0;

          return (
            <div key={opcion}>
              <label className="flex items-center gap-2 text-app-text">
                <input
                  type="radio"
                  name={titulo}
                  value={opcion}
                  checked={miVotoActual === opcion}
                  onChange={() => onVotar(opcion)}
                  disabled={!puedeVotar}
                />
                {opcion}
              </label>

              <p className="text-sm text-app-muted ml-6">
                {datos.conteo} votos · peso {datos.peso.toFixed(1)} ({porcentaje}%)
              </p>
            </div>
          );
        })}
      </div>

      {!puedeVotar && (
        <p className="text-sm text-app-muted mt-3">
          Solo los miembros del gremio pueden votar mientras la votación está abierta.
        </p>
      )}
    </fieldset>
  );
}

export default CategoriaVotacion;