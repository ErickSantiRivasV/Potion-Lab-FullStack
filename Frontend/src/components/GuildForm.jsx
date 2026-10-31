import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import Button from "./buttons/Button";
import { AuthContext } from "../context/AuthContext";

function GuildForm({ onCreateGuild }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [emblem, setEmblem] = useState("");
  const [type, setType] = useState("Public");

  function generarCodigo() {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";

    for (let i = 0; i < 6; i++) {
      const posicion = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres[posicion];
    }

    return codigo;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!user) return;
    if (name.trim() === "") return;

    const newGuild = {
      id: Date.now(),
      name: name,
      motto: motto,
      emblem: emblem || "🧪",
      type: type,
      inviteCode: type === "Private" ? generarCodigo() : null,
      // El creador queda automáticamente como Grandmaster del gremio
      members: [
        {
          id: user.id,
          name: user.name,
          specialty: user.specialty,
          role: "Grandmaster",
          joinDate: new Date().toISOString().slice(0, 10),
        },
      ],
    };

    onCreateGuild(newGuild);

    setName("");
    setMotto("");
    setEmblem("");
    setType("Public");
  }

  if (!user) {
    return (
      <Card className="p-6 mb-6">
        <p className="text-app-muted">
          Debes iniciar sesión para crear un gremio.
        </p>

        <Button onClick={() => navigate("/login")} className="mt-4">
          Iniciar sesión
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-2xl font-bold text-app-text mb-4">
        Crear gremio
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-app-text font-semibold mb-1">
            Nombre del gremio
          </label>

          <input
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Alquimistas EIA"
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          />
        </div>

        <div>
          <label className="block text-app-text font-semibold mb-1">
            Lema
          </label>

          <input
            type="text"
            value={motto}
            maxLength={100}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="Ej: El conocimiento es nuestra fórmula"
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          />
        </div>

        <div>
          <label className="block text-app-text font-semibold mb-1">
            Emblema
          </label>

          <input
            type="text"
            value={emblem}
            onChange={(e) => setEmblem(e.target.value)}
            placeholder="Ej: 🧪"
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          />
        </div>

        <div>
          <label className="block text-app-text font-semibold mb-1">
            Tipo de gremio
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
          >
            <option value="Public">Público</option>
            <option value="Private">Privado</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-purple-accent text-white px-5 py-2.5 rounded-button font-semibold hover:opacity-90 transition"
        >
          Crear gremio
        </button>
      </form>
    </Card>
  );
}

export default GuildForm;