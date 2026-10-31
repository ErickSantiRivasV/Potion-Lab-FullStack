import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import Button from "./buttons/Button";
import { AuthContext } from "../context/AuthContext";

function FormulaForm({ onCreateFormula, canCreate }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [effect, setEffect] = useState("");
  const [difficulty, setDifficulty] = useState("1");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  // Límites de fecha: desde mañana hasta dentro de 7 días
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const fechaMaxima = new Date(hoy);
  fechaMaxima.setDate(fechaMaxima.getDate() + 7);

  function aFechaInput(fecha) {
    return fecha.toISOString().slice(0, 10);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!user || !canCreate) return;

    setError("");

    if (name.trim() === "" || effect.trim() === "" || endDate === "") {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const hoySinHora = new Date();
    hoySinHora.setHours(0, 0, 0, 0);

    const fechaLimite = new Date(endDate);
    const maxFecha = new Date(hoySinHora);
    maxFecha.setDate(maxFecha.getDate() + 7);

    if (fechaLimite <= hoySinHora) {
      setError("La fecha límite debe ser un día futuro.");
      return;
    }

    if (fechaLimite > maxFecha) {
      setError("La fecha límite no puede pasar de 7 días desde hoy.");
      return;
    }

    const newFormula = {
      id: Date.now(),
      name: name.trim(),
      effect: effect.trim(),
      difficulty: Number(difficulty),
      state: "Proposal",
      endDate: endDate,
      createdBy: user.id,
      createdByName: user.name,

      stateHistory: [
        {
          state: "Proposal",
          changedAt: new Date().toISOString(),
          changedBy: user.name,
        },
        
      ],
            votes: {
        ingredient: {},
        method: {},
        flask: {},
      },

      categories: {
        ingredient: {
          name: "Ingrediente base",
          options: ["Raíz de Mandrágora", "Polvo de Estrellas"],
        },

        method: {
          name: "Método de calentamiento",
          options: ["Llama Azul", "Baño de Agua Arcana"],
        },

        flask: {
          name: "Tipo de frasco",
          options: ["Cristal Lunar", "Cráneo de Plata"],
        },
      },
    };

    onCreateFormula(newFormula);

    setName("");
    setEffect("");
    setDifficulty("1");
    setEndDate("");
  }

  if (!user) {
    return (
      <Card className="p-6 mb-6">
        <p className="text-app-muted">
          Debes iniciar sesión para proponer una fórmula.
        </p>

        <Button onClick={() => navigate("/login")} className="mt-4">
          Iniciar sesión
        </Button>
      </Card>
    );
  }

  if (!canCreate) {
    return (
      <Card className="p-6 mb-6">
        <p className="text-app-muted">
          Solo el Grandmaster o los Senior Alchemist de este gremio pueden proponer fórmulas.
          Únete al gremio y espera a que te asciendan.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-2xl font-bold text-app-text mb-4">
        Crear fórmula
      </h2>

      {error && (
        <p className="text-red-500 text-sm mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-app-text font-semibold mb-1">
            Nombre de la poción
          </label>

          <input
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Poción del Conocimiento"
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          />

          <p className="text-sm text-app-muted mt-1">
            {name.length}/50 caracteres
          </p>
        </div>

        <div>
          <label className="block text-app-text font-semibold mb-1">
            Efecto deseado
          </label>

          <textarea
            value={effect}
            maxLength={200}
            onChange={(e) => setEffect(e.target.value)}
            placeholder="Ej: Aumentar temporalmente la capacidad de aprendizaje."
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text min-h-28"
          />

          <p className="text-sm text-app-muted mt-1">
            {effect.length}/200 caracteres
          </p>
        </div>

        <div>
          <label className="block text-app-text font-semibold mb-1">
            Dificultad
          </label>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          >
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
            <option value="4">Arcane</option>
          </select>
        </div>

        <div>
          <label className="block text-app-text font-semibold mb-1">
            Fecha límite de votación
          </label>

          <input
            type="date"
            value={endDate}
            min={aFechaInput(manana)}
            max={aFechaInput(fechaMaxima)}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          />

          <p className="text-sm text-app-muted mt-1">
            La fecha límite debe estar dentro de los próximos 7 días.
          </p>
        </div>

        <fieldset className="p-4 rounded-button bg-app-bg border border-app-border">
          <legend className="font-semibold text-app-text mb-3 px-1">
            Categorías de votación
          </legend>

          <div className="space-y-3 text-sm">

            <div>
              <p className="font-semibold text-app-text">
                Ingrediente base
              </p>

              <p className="text-app-muted">
                Raíz de Mandrágora vs Polvo de Estrellas
              </p>
            </div>

            <div>
              <p className="font-semibold text-app-text">
                Método de calentamiento
              </p>

              <p className="text-app-muted">
                Llama Azul vs Baño de Agua Arcana
              </p>
            </div>

            <div>
              <p className="font-semibold text-app-text">
                Tipo de frasco
              </p>

              <p className="text-app-muted">
                Cristal Lunar vs Cráneo de Plata
              </p>
            </div>

          </div>
        </fieldset>

        <button
          type="submit"
          className="bg-purple-accent text-white px-5 py-2.5 rounded-button font-semibold hover:opacity-90 transition"
        >
          Crear fórmula
        </button>

      </form>
    </Card>
  );
}

export default FormulaForm;