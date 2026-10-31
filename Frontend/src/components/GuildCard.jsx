import { Link } from "react-router-dom";
import Card from "./Card";

function GuildCard({ guild }) {
  return (
    <Card hover className="p-5">
      <div className="text-4xl mb-4">
        {guild.emblem}
      </div>

      <h2 className="text-xl font-bold text-app-text">
        {guild.name}
      </h2>

      <p className="text-app-muted mt-2">
        {guild.motto}
      </p>

      <p className="text-sm text-purple-accent mt-4">
        {guild.type === "Private" ? "Privado" : "Público"}
      </p>

      <p className="text-sm text-app-muted mt-2">
        {guild.members.length} miembros
      </p>

      <Link
        to={`/gremio/${guild.id}`}
        className="inline-block mt-4 text-purple-accent hover:underline"
      >
        Ver gremio
      </Link>
    </Card>
  );
}

export default GuildCard;