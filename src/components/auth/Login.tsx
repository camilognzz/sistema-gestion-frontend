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

            if (userData?.token && userData.user) {
                localStorage.setItem('token', userData.token);
                localStorage.setItem('role', userData.user.role);
                navigate('/profile');
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
                setError('');
            }, 5000);
        }
    };


    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email: </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password: </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
};
