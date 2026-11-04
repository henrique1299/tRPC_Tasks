"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import type { AppRouter } from "~/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type TaskType = RouterOutputs["tasks"]["getAll"][number];

export function TaskList() {
  const utils = api.useUtils();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = api.tasks.getInfiniteTasks.useInfiniteQuery(
    {
      limit: 4,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deleteTask = api.tasks.delete.useMutation({
    onSuccess: async () => {
      await utils.tasks.getInfiniteTasks.invalidate();
      alert(`Tarefa deletada com sucesso.`);
    },
    onError: (error) => {
      alert(`Erro ao deletar tarefa: ${error.message}`);
    }
  });

  const updateTask = api.tasks.update.useMutation({
    onSuccess: async () => {
      setEditingId(null);
      await utils.tasks.getInfiniteTasks.invalidate();
      alert(`Tarefa atualizada com sucesso.`);
    },
    onError: (error) => {
      alert(`Erro ao atualizar tarefa: ${error.message}`);
    }
  });

  const handleStartEdit = (task: TaskType) => {
    setEditingId(task.id);
    setEditTitulo(task.titulo);
    setEditDescricao(task.descricao ?? "");
    setDataDescricao(new Date());
  };

  const handleSaveEdit = (id: number) => {
    if (!editTitulo.trim()) return;
    updateTask.mutate({
      id,
      titulo: editTitulo,
      descricao: editDescricao,
      dataCriacao: new Date(),
    });
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editDataCriacao, setDataDescricao] = useState(new Date());
  
    if (status === "pending") {
    return <div className="text-center text-white">Carregando tarefas...</div>;
  }

  if (status === "error") {
    return <div className="text-center text-red-400">Erro ao carregar tarefas.</div>;
  }

  const _tasks = data.pages.flatMap((page) => page.items);


  // Exibe a lista de tarefas. Exibe o texto sólido ou o form de edição dependendo do estado.
  return (
    <div className="w-full flex flex-col">
      <ul className="max-h-[500px] overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar">
        {_tasks.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhuma tarefa encontrada.</p>
        ) : (
          _tasks.map((task) => {
            const isEditing = editingId === task.id;

            return (
              <li 
                key={task.id} 
                className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col gap-3"
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <textarea
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                      className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-3 py-2 rounded transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        disabled={updateTask.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded transition-colors disabled:bg-gray-600"
                      >
                        {updateTask.isPending ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">{task.titulo}</h3>
                      {task.descricao && <p className="text-gray-400 text-sm mt-1">{task.descricao}</p>}
                      <span className="text-xs text-gray-500 block mt-2">
                        Criada em: {new Date(task.dataCriacao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                            deleteTask.mutate({ id: task.id });
                          }
                        }}
                        disabled={deleteTask.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded transition-colors disabled:bg-gray-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })
        )}

        <div ref={ref} className="py-2 text-center">
          {isFetchingNextPage && (
            <span className="text-sm text-gray-400">Carregando mais tarefas...</span>
          )}
          {!hasNextPage && _tasks.length > 0 && (
            <span className="text-xs text-gray-500">Você chegou ao fim da lista.</span>
          )}
        </div>
      </ul>
    </div>
  );
}