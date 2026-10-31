import { Link } from "react-router-dom";
import Card from "./Card";

function estadoTexto(state) {
  const textos = {
    Proposal: "Propuesta",
    VotingOpen: "Votación abierta",
    Closed: "Cerrada",
    Distilled: "Destilada",
  };

  return textos[state] || state;
}

function FormulaCard({ formula }) {
  return (
    <Card hover className="p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-app-text">
          {formula.name}
        </h3>

        <span className="text-sm text-purple-accent">
          {estadoTexto(formula.state)}
        </span>
      </div>

      <p className="text-app-muted mt-3">
        {formula.effect}
      </p>

      <p className="text-sm text-app-muted mt-4">
        Propuesta por: {formula.createdByName || "Alquimista desconocido"}
      </p>

      <p className="text-sm text-app-muted mt-1">
        Dificultad: {formula.difficulty}
      </p>

      <p className="text-sm text-app-muted mt-1">
        Fecha límite: {formula.endDate}
      </p>

      <Link
        to={`/formula/${formula.id}`}
        className="inline-block mt-4 bg-purple-accent text-white px-4 py-2 rounded-button hover:opacity-90 transition"
      >
        Ver fórmula
      </Link>
    </Card>
  );
}

export default FormulaCard;