import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Users from "../service/Users"; // Ajusta la ruta si es necesario
import { Eye, EyeOff } from "lucide-react"; // Instala lucide-react si no lo tienes

export const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(15);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isBlocked) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setIsBlocked(false);
            setAttempts(0);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBlocked]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBlocked || isLoading) return;
    setPassword("");

    try {
      setIsLoading(true);
      const userData = await Users.login(email, password);
      if (userData.token) {
        localStorage.setItem("token", userData.token);
        if (userData.user) {
          localStorage.setItem("role", userData.user.role);
        }
        setTimeout(() => {
          navigate("/profile");
        }, 1000); // Retraso de 1 segundo para mostrar la carga
      } else {
        setError("Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.");
        setEmail("");
        setPassword("");
        setAttempts((prev) => prev + 1);
      }
    } catch {
      setError("Error al iniciar sesión. Verifique sus credenciales.");
      setEmail("");
      setPassword("");
      setAttempts((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }

    if (attempts + 1 >= 3) {
      setIsBlocked(true);
      setError("Has excedido el número de intentos permitidos.");
    }

    setTimeout(() => {
      setError("");
    }, 5000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full flex flex-col items-center">
          <img
            src="/images/logo-f-h-r.png"
            alt="Logo Fundación Habacuc"
            className="w-24 h-24 mb-6"
          />

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {isBlocked && (
            <p className="text-red-600 text-sm font-medium text-center mb-4">
              Demasiados intentos fallidos. Intente nuevamente en {timer}{" "}
              segundos.
            </p>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tucorreo@fundacionhabacuc.org"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isBlocked || isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="•••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isBlocked || isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200"
                  disabled={isBlocked || isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium text-center">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isBlocked || isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Iniciando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-gray-600 text-center">
            Powered by
            <a
              href="https://camilogonzalez.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline ml-1 transition-all duration-200"
            >
              Camilognzz
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};