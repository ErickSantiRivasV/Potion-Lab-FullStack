import { useContext } from "react";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBarFinal";
import Card from "../../components/Card";
import { AuthContext } from "../../context/AuthContext";

function AdminDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-app-bg p-6 sm:p-8">
        <section className="max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8">
            <p className="text-purple-accent font-semibold mb-2">
              PANEL DE ADMINISTRACIÓN
            </p>

            <h1 className="text-3xl font-bold text-app-text">
              Bienvenido, {user.name}
            </h1>

            <p className="text-app-muted mt-3">
              Tu cuenta tiene permisos de administrador en Potion Lab.
            </p>

            <p className="text-app-muted mt-2">
              Rol: <strong className="text-app-text">Administrador</strong>
            </p>

            <Link
              to="/perfil"
              className="inline-block mt-6 text-purple-accent font-semibold hover:underline"
            >
              Consultar mi perfil
            </Link>
          </Card>
        </section>
      </main>
    </>
  );
}

export default AdminDashboard;
