import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";
import Button from "../components/buttons/Button";
import { AuthContext } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return (
      <>
        <NavBar />

        <main className="min-h-screen bg-app-bg p-8">
          <Card className="max-w-xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-app-text">
              No has iniciado sesión
            </h1>

            <p className="text-app-muted mt-2">
              Inicia sesión para ver tu perfil.
            </p>

            <Button
              onClick={() => navigate("/login")}
              className="mt-6"
            >
              Iniciar sesión
            </Button>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-app-bg p-8">
        <section className="max-w-xl mx-auto">

          <Card className="p-6">

            <div className="flex items-center gap-4 mb-6">

              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`Avatar de ${user.name}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-soft flex items-center justify-center text-3xl">
                  🧙
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-app-text">
                  {user.name}
                </h1>

                <p className="text-purple-accent">
                  {user.specialty}
                </p>
              </div>

            </div>

            <div className="space-y-4">

              <div>
                <p className="text-sm text-app-muted">
                  Correo universitario
                </p>

                <p className="text-app-text font-semibold">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-app-muted">
                  Especialidad alquímica
                </p>

                <p className="text-app-text font-semibold">
                  {user.specialty}
                </p>
              </div>

            </div>

            <Button
              onClick={handleLogout}
              className="mt-6 bg-red-500 hover:bg-red-600"
            >
              Cerrar sesión
            </Button>

          </Card>

        </section>
      </main>
    </>
  );
}

export default Profile;