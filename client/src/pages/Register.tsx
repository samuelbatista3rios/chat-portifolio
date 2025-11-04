import { useState } from "react";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export default function Register() {
  const { register, loading } = useAuth();
  const [username, setUsername] = useState("NewUser");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123123");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      toast.success("Conta criada!");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Erro ao cadastrar");
    }
  };

  return (
    <div className="grid place-items-center py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-panel p-6 rounded-lg border border-panel2 space-y-4"
      >
        <h1 className="text-xl font-semibold">Criar conta</h1>
        <input
          className="w-full p-2 rounded bg-panel2"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 rounded bg-panel2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 rounded bg-panel2"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full py-2 rounded bg-primary/80 hover:bg-primary"
        >
          {loading ? "..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
