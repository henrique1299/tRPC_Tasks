# TASKS App

Um gerenciador de tarefas moderno desenvolvido com a **T3 Stack** (Next.js App Router, tRPC, Tailwind CSS e TypeScript), focando em alta performance, type-safety de ponta a ponta e uma experiência de usuário fluida com carregamento sob demanda (**Infinite Scroll**).

---

## Tecnologias Utilizadas

*   **[Next.js](https://nextjs.org/) (App Router)**: Framework React para renderização híbrida (Server e Client Components).
*   **[tRPC](https://trpc.io/)**: Comunicação type-safe entre cliente e servidor sem necessidade de schemas em JSON/OpenAPI separados.
*   **[Tailwind CSS](https://tailwindcss.com/)**: Estilização utilitária e responsiva.
*   **[Zod](https://zod.dev/)**: Validação de esquemas e dados em tempo de execução.
*   **[React Intersection Observer](https://github.com/thebuilder/react-intersection-observer)**: Monitoramento de rolagem para paginação infinita.

---

## Arquitetura e Principais Pontos de Funcionamento

O projeto adota uma arquitetura modular inspirada na **T3 Stack**, dividindo-se entre a camada de apresentação (`app/`), componentes de interface (`_components/`) e a camada de rotas/servidor tRPC (`server/api/`).

### 1. **Server-Side Rendering (SSR) e Hydration (`app/page.tsx`)**
A página inicial utiliza recursos do Next.js App Router combinados com tRPC para realizar o **Prefetch** dos dados no servidor antes de enviá-los ao cliente:
*   Faz a chamada de pré-carregamento (`prefetchInfinite`) para as primeiras tarefas.
*   Envolve o layout com o componente `<HydrateClient>` para hidratar o cache do React Query no cliente instantaneamente.

### 2. **Scroll Infinito Dinâmico (`TaskList.tsx`)**
A listagem de tarefas implementa paginação baseada em cursor através da query `getInfiniteTasks.useInfiniteQuery`:
*   Utiliza a biblioteca `react-intersection-observer` para detectar quando o usuário chega ao final da lista (`inView`).
*   Dispara automaticamente a função `fetchNextPage()` para carregar novos lotes de tarefas de forma assídua e sem recarregar a página.

### 3. **Mutations e Invalidação de Cache (`tRPC Mutations`)**
As operações de escrita (`create`, `update`, `delete`) utilizam o sistema de mutações do tRPC integrado ao React Query:
*   Após o sucesso de qualquer alteração (`onSuccess`), o cache do tRPC é invalidado (`utils.tasks.getInfiniteTasks.invalidate()`), forçando a atualização automática da listagem em tempo real.

### 4. **Camada de Backend e Rotas tRPC (`taskRouter`)**
O servidor gerencia os dados através de rotas tipadas com procedimentos (`publicProcedure`):
*   **Validação com Zod:** Os dados enviados do cliente para o servidor passam por validações rigorosas de esquema (garantindo tipos corretos para ids, títulos, descrições e timestamps).
*   **Paginação por Cursor:** A rota `getInfiniteTasks` fatia o array de dados em memória utilizando limites e deslocamentos/cursores, retornando os itens e o próximo ponteiro.

---

## Estrutura do Projeto

```text
├── src/
│   ├── app/
│   │   ├── _components/       # Componentes de UI (TaskList, CreateTaskForm)
│   │   ├── page.tsx           # Página principal (SSR + Hydration)
│   │   └── layout.tsx         # Layout global e provedores
│   ├── server/
│   │   └── api/
│   │       ├── root.java/trpc # Configuração das rotas da API
│   │       └── routers/       # Implementação do taskRouter (lógica de backend)
│   └── trpc/                  # Configuração do cliente/servidor tRPC