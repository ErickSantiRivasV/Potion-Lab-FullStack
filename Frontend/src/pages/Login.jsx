import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/Card";
import Input from "../components/inputs/Input";
import Button from "../components/buttons/Button";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const resultado = await login(email, password);

    setLoading(false);

    if (resultado.success) {
      const destino = location.state?.from?.pathname || "/";
      navigate(destino, { replace: true });
    } else {
      setError(resultado.message);
    }
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
          Iniciar sesión
        </h1>

        <p className="text-app-muted mb-6">
          Entra a tu laboratorio de pociones.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <p className="text-app-muted text-sm mt-6 text-center">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="text-purple-accent hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default Login;
