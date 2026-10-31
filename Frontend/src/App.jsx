import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Guilds from "./pages/Guilds";
import GuildDetail from "./pages/GuildDetail";
import FormulaDetail from "./pages/FormulaDetail";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Grimoire from "./pages/Grimoire";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/grimorio"
        element={
          <ProtectedRoute>
            <Grimoire />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gremios"
        element={
          <ProtectedRoute>
            <Guilds />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gremio/:id"
        element={
          <ProtectedRoute>
            <GuildDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/formula/:id"
        element={
          <ProtectedRoute>
            <FormulaDetail />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
