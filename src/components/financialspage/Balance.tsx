import React, { useState, useEffect } from "react";
import Financials from "../service/Financials"; 
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";

const formatAmount = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const Balance: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }
      const balanceResponse = await Financials.getCurrentBalance(token);
      setBalance(balanceResponse);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Error al obtener el balance. Por favor, intenta de nuevo.");
      setBalance(0); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Balance Actual</h2>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Cargando...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 font-medium">{error}</div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600 mb-2">Balance total (Ingresos - Gastos):</p>
                <p
                  className={`text-4xl font-bold ${
                    balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatAmount(balance)}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Balance;