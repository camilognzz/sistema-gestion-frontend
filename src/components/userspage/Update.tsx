import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Users from "../service/Users";
import Navbar from "../common/Navbar";

function Update() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "USER", // Valor por defecto
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDataById(userId);
    }
  }, [userId]);

  const fetchUserDataById = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found.");
        return;
      }
  
      const response = await Users.getUserById(userId, token);
      console.log("✅ API Response:", response); // Verifica la estructura de la respuesta
  
      // ✅ Ahora accedemos correctamente a `response.user`
      if (response && response.user) {
        const { name = "", email = "", role = "" } = response.user; 
        setUserData({ name, email, role });
        setLoading(false);
      } else {
        console.error("❌ No se encontró el usuario en la respuesta.");
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setLoading(false);
    }
  };
  
  



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const confirmUpdate = window.confirm("Are you sure you want to update this user?");
      if (confirmUpdate) {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No authentication token found.");
          return;
        }

        if (!userId) {
          console.error("❌ userId is undefined");
          return;
        }

        setUpdating(true);
        await Users.updateUser(Number(userId), userData, token);
        console.log("✅ User updated");
        navigate("/admin/user-management");
      }
    } catch (error) {
      console.error("❌ Error updating user profile:", error);
      alert("Error updating user");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Cargando datos...</p>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Actualizar Usuario
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium">
                Nombre:
              </label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium">
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium">
                Rol:
              </label>
              <select
                name="role"
                value={userData.role}
                onChange={handleInputChange}
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition disabled:bg-gray-400"
            >
              {updating ? "Actualizando..." : "Actualizar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Update;
