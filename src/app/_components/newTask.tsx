"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function CreateTaskForm() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [id, setId] = useState(0);

  const utils = api.useUtils();
  const createTask = api.tasks.create.useMutation({
    onSuccess: async () => {
      setTitulo("");
      setDescricao("");
      setId(0);
      await utils.tasks.invalidate(); 
    },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    createTask.mutate({
      id,
      titulo,
      descricao,
      dataCriacao: new Date(),
    });
  };

  return (
    <div className="w-full max-w-xs">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
          required
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button 
          type="submit" 
          disabled={createTask.isPending}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          {createTask.isPending ? "Criando..." : "Criar Tarefa"}
        </button>
      </form>
    </div>
  );
}
