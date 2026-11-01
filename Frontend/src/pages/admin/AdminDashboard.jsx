import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBarFinal";
import Card from "../../components/Card";
import { AuthContext } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { obtenerMensajeError } from "../../utils/errores";

function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [eliminandoId, setEliminandoId] = useState("");

  useEffect(() => {
    let activo = true;

    userService
      .listar()
      .then((lista) => {
        if (activo) setUsuarios(lista);
      })
      .catch((e) => {
        if (activo) {
          setError(
            obtenerMensajeError(e, "No fue posible cargar los usuarios."),
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  async function eliminarUsuario(usuario) {
    const confirmar = window.confirm(
      `¿Eliminar a ${usuario.name}? Esta acción no se puede deshacer.`,
    );

    if (!confirmar) return;

    setErrorAccion("");
    setEliminandoId(usuario.id);

    try {
      await userService.eliminar(usuario.id);
      setUsuarios((anteriores) =>
        anteriores.filter((u) => u.id !== usuario.id),
      );
    } catch (e) {
      setErrorAccion(
        obtenerMensajeError(e, "No fue posible eliminar el usuario."),
      );
    } finally {
      setEliminandoId("");
    }
  }

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

            <Link
              to="/perfil"
              className="inline-block mt-4 text-purple-accent font-semibold hover:underline"
            >
              Consultar mi perfil
            </Link>
          </Card>

          <Card className="p-6 sm:p-8 mt-6">
            <h2 className="text-2xl font-bold text-app-text mb-4">
              Usuarios registrados
            </h2>

            {errorAccion && (
              <p className="text-red-500 text-sm mb-4" role="alert">
                {errorAccion}
              </p>
            )}

            {cargando && (
              <p className="text-app-muted" role="status">
                Cargando usuarios...
              </p>
            )}

            {!cargando && error && (
              <p className="text-red-500" role="alert">
                {error}
              </p>
            )}

            {!cargando && !error && usuarios.length === 0 && (
              <p className="text-app-muted">No hay usuarios registrados.</p>
            )}

            {!cargando && !error && usuarios.length > 0 && (
              <ul className="space-y-3">
                {usuarios.map((usuario) => (
                  <li
                    key={usuario.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-button border border-app-border bg-app-bg"
                  >
                    <div>
                      <p className="text-app-text font-semibold">
                        {usuario.name}
                        {usuario.role === "admin" && (
                          <span className="ml-2 text-xs text-purple-accent">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-app-muted">
                        {usuario.email} · {usuario.specialty}
                      </p>
                    </div>

                    {usuario.id !== user.id && (
                      <button
                        type="button"
                        onClick={() => eliminarUsuario(usuario)}
                        disabled={eliminandoId === usuario.id}
                        className="text-sm px-3 py-1.5 rounded-button border border-red-500 text-red-500 hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {eliminandoId === usuario.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </main>
    </>
  );
}

export default AdminDashboard;
