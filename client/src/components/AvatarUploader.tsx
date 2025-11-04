import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";
import type { AxiosError } from "axios"

export default function AvatarUploader() {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);

  const upload = async () => {
    if (!file || !user) return;
    const form = new FormData();
    form.append("avatar", file);
    form.append("userId", user._id);
    try {
      const { data } = await api.post("/users/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, avatar: data.avatar });
      toast.success("Avatar atualizado!");
    } catch (error: unknown) {
  const err = error as AxiosError<{ message: string }>;
  toast.error(err.response?.data?.message || "Erro ao enviar avatar");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
      <button onClick={upload} className="px-3 py-1 rounded bg-panel2 hover:bg-panel">Enviar</button>
    </div>
  );
}
