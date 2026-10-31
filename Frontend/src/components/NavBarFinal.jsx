import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Inicio" },
    { to: "/gremios", label: "Gremios" },
    { to: "/grimorio", label: "Grimorio" },
    { to: "/perfil", label: "Perfil" },
  ];

  const renderLinks = links
    .filter((link) => link.to === "/" || user)
    .map((link) => (
      <li key={link.to}>
        <NavLink
          to={link.to}
          className={({ isActive }) =>
            `px-3 py-2 rounded-button font-semibold ${
              isActive
                ? "bg-purple-soft text-purple-accent"
                : "text-app-text"
            }`
          }
        >
          {link.label}
        </NavLink>
      </li>
    ));

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 p-4 bg-app-surface border-b border-app-border">
      <NavLink
        to="/"
        className="text-xl font-bold text-purple-accent"
      >
        Potion Lab
      </NavLink>

      <div className="flex flex-wrap items-center gap-2">
        <ul className="flex flex-wrap items-center gap-2 list-none">
          {renderLinks}

          {user?.role === "admin" && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-button font-semibold ${
                    isActive
                      ? "bg-purple-soft text-purple-accent"
                      : "text-app-text"
                  }`
                }
              >
                Administración
              </NavLink>
            </li>
          )}
        </ul>

        {user ? (
          <>
            <span className="ml-2 text-sm text-app-muted">
              Hola, {user.name}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-button font-semibold text-app-text hover:bg-app-bg transition"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className="px-3 py-2 rounded-button font-semibold text-app-text"
            >
              Iniciar sesión
            </NavLink>

            <NavLink
              to="/register"
              className="px-3 py-2 rounded-button font-semibold bg-purple-accent text-white"
            >
              Registrarse
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
