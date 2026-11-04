import type { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


interface ITask {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: Timestamp;
}

class Task implements ITask {
  constructor(
    public id:number, 
    public titulo:string, 
    public descricao:string, 
    public dataCriacao:Timestamp
  ) {}
}

var id = 20;

export let tasks: ITask[]  = [
  { id: 1, titulo: "Estudar Next.js App Router", descricao: "Aprender sobre server e client components", dataCriacao: new Date("2026-11-01").getDate() },
  { id: 2, titulo: "Configurar tRPC", descricao: "Integrar tRPC com React Query e Next.js", dataCriacao: new Date("2026-11-01").getDate() },
  { id: 3, titulo: "Implementar Scroll Infinito", descricao: "Usar useInfiniteQuery e intersection observer", dataCriacao: new Date("2026-11-01").getDate() },
  { id: 4, titulo: "Criar formulário de tarefas", descricao: "Adicionar validação com Zod", dataCriacao: new Date("2026-11-02").getDate() },
  { id: 5, titulo: "Estilizar com Tailwind CSS", descricao: "Deixar a aplicação bonita e responsiva", dataCriacao: new Date("2026-11-02").getDate() },
  { id: 6, titulo: "Testar aplicação", descricao: "Garantir que todas as mutations funcionam", dataCriacao: new Date("2026-11-02").getDate() },
  { id: 7, titulo: "Configurar banco de dados", descricao: "Mudar de array em memória para Prisma/SQLite", dataCriacao: new Date("2026-11-02").getDate() },
  { id: 8, titulo: "Escrever testes unitários", descricao: "Testar routers do tRPC com Vitest", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 9, titulo: "Adicionar autenticação", descricao: "Implementar NextAuth.js no projeto", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 10, titulo: "Criar página de perfil", descricao: "Exibir dados do usuário logado", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 11, titulo: "Implementar modo escuro", descricao: "Adicionar toggle de Dark/Light mode com Tailwind", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 12, titulo: "Otimizar performance", descricao: "Analisar bundle size e imagens", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 13, titulo: "Configurar deploy na Vercel", descricao: "Fazer o primeiro deploy em produção", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 14, titulo: "Adicionar animações", descricao: "Usar Framer Motion para transições suaves", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 15, titulo: "Criar filtros de tarefas", descricao: "Filtrar por concluídas e pendentes", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 16, titulo: "Adicionar barra de busca", descricao: "Pesquisar tarefas por título", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 17, titulo: "Implementar drag and drop", descricao: "Reordenar tarefas arrastando", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 18, titulo: "Configurar notificações", descricao: "Avisos toast ao criar ou excluir tarefas", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 19, titulo: "Revisar documentação", descricao: "Atualizar o README.md do repositório", dataCriacao: new Date("2026-11-03").getDate() },
  { id: 20, titulo: "Planejar próxima sprint", descricao: "Definir novas features para o app de tasks", dataCriacao: new Date("2026-11-03").getDate() },
];

const createTaskSchema = z
  .object({
    id: z.number(),
    titulo: z.string(),
    descricao: z.string(),
    dataCriacao: z.date().transform((date) => date.getTime()),
  })
  .transform((data) => new Task(data.id, data.titulo, data.descricao, data.dataCriacao));

export const taskRouter = createTRPCRouter({
  create: publicProcedure
    .input(createTaskSchema)
    .mutation(async ({ input }) => {
      const task: ITask = {
        id: id,
        titulo: input.titulo,
        descricao: input.descricao,
        dataCriacao: input.dataCriacao
      };
      tasks.push(task);
      id++;
      return task;
    }),

  update: publicProcedure
    .input(createTaskSchema)
    .mutation(async ({ input }) => {
      const taskToUpdate = tasks.find(task => task.id === input.id);
      if (taskToUpdate)
      {
        taskToUpdate.titulo = input.titulo;
        taskToUpdate.descricao = input.descricao;
        taskToUpdate.dataCriacao = input.dataCriacao;
      }
      return taskToUpdate;
    }),

  delete: publicProcedure
    .input( z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const index = tasks.findIndex(task => task.id === input.id);
      if (index !== -1) 
      {
        tasks.splice(index, 1);
      }
    }),

  getAll: publicProcedure.query(() => {
    return tasks;
  }),

  getInfiniteTasks: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(4).default(4),
        cursor: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor } = input;
      
      const sliceStart = cursor;
      const sliceEnd = sliceStart + limit;
      
      const items = tasks.slice(sliceStart, sliceEnd);
      
      let nextCursor: number | undefined = undefined;
      if (sliceEnd < tasks.length) {
        nextCursor = sliceEnd;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
