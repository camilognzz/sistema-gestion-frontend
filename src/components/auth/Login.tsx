import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Users from "../service/Users";

export const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const userData = await Users.login(email, password);
            console.log("Respuesta del servidor:", userData); // Verifica qué llega

            if (userData?.token) {
                localStorage.setItem("token", userData.token);
                console.log("Token guardado correctamente:", userData.token);
                navigate("/profile");
            } else {
                setError("Credenciales incorrectas");
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Error desconocido");
            }

            setTimeout(() => {
                setError("");
            }, 5000);
        }
    };



    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="bg-white p-8 rounded-lg shadow-lg max-x-sm w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Login
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div className="mt-10">
                        <button
                            type="submit"
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-pink-400 text-white rounded-lg transition-all duration-300
                                           transform hover:bg-gradient-to-r hover:from-purple-500 hover:to-green-400 hover:translate-y-[-4px] hover:shadow-lg">
                            Ingresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
