import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import { Login } from "./components/auth/Login";
import Registration from "./components/auth/Registration";
import Footer from "./components/common/Footer";
import Update from "./components/userspage/Update";
import Management from "./components/userspage/Management";
import Profile from "./components/userspage/Profile";
import AdminRoute from "./components/userspage/AdminRoute"; // Importa el nuevo componente

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />

            {/* Rutas protegidas para Admin */}
            <Route
              path="/register"
              element={
                <AdminRoute>
                  <Registration />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/user-management"
              element={
                <AdminRoute>
                  <Management />
                </AdminRoute>
              }
            />
            <Route
              path="/update-user/:userId"
              element={
                <AdminRoute>
                  <Update />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
