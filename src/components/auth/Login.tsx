import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Users from "../service/Users";

export const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [attempts, setAttempts] = useState<number>(0);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(15);

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
        if (isBlocked) return;
        setPassword("");

        try {
            const userData = await Users.login(email, password);

            if (userData?.token) {
                localStorage.setItem("token", userData.token);
                navigate("/profile");
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
        }

        if (attempts + 1 >= 3) {
            setIsBlocked(true);
            setError("Has excedido el número de intentos permitidos.");
        }

        setTimeout(() => {
            setError("");
        }, 5000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-11/12 sm:w-full flex flex-col items-center">
                <img src="/images/logo-f-h-r.png" alt="Logo Fundación Habacuc" className="w-25 h-25 mb-4" />

                <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>

                {isBlocked && (
                    <p className="text-red-600 font-semibold text-center mt-2">
                        Demasiados intentos fallidos. Intente nuevamente en {timer} segundos.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-medium">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tucorreo@fundacionhabacuc.org"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            disabled={isBlocked}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 font-medium">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="•••••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            disabled={isBlocked}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="mt-6">
                        <button
                            type="submit"
                            className={`w-full py-2 cursor-pointer bg-blue-500 text-white rounded-lg transition-all duration-300 transform 
                            ${isBlocked ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:translate-y-[-2px] hover:shadow-lg"}`}
                            disabled={isBlocked}
                        >
                            Ingresar
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-sm text-gray-600">
                    Powered by
                    <a href="https://camilogonzalez.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                        Camilognzz
                    </a>
                </div>
            </div>
        </div>
    );
};
