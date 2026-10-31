import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/Card";
import Input from "../components/inputs/Input";
import Button from "../components/buttons/Button";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("Herbalist");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const resultado = await register(
      name,
      email,
      password,
      specialty,
      avatar,
    );

    setLoading(false);

    if (!resultado.success) {
      setError(resultado.message);
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <main className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6">
        <Link
          to="/"
          className="inline-block mb-4 text-purple-accent hover:underline"
        >
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-app-text mb-2">
          Crear cuenta
        </h1>

        <p className="text-app-muted mb-6">
          Regístrate en Potion Lab.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            type="text"
            placeholder="Tu nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            autoComplete="name"
          />

          <Input
            label="Correo universitario"
            type="email"
            placeholder="correo@universidad.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <fieldset>
            <legend className="block text-app-text font-semibold mb-1">
              Especialidad alquímica
            </legend>

            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full p-3 rounded-button border border-app-border bg-app-surface text-app-text"
            >
              <option value="Herbalist">Herbalist</option>
              <option value="Runist">Runist</option>
              <option value="Taster">Taster</option>
              <option value="Brewmaster">Brewmaster</option>
              <option value="Enchanting">Enchanting</option>
            </select>
          </fieldset>

          <Input
            label="Avatar URL (opcional)"
            type="url"
            placeholder="https://..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            autoComplete="url"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>

        <p className="text-app-muted text-sm mt-6 text-center">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-purple-accent hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default Register;
