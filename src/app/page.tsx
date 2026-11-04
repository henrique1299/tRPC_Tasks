
import { HydrateClient } from "~/trpc/server";
import { CreateTaskForm } from "~/app/_components/newTask"
import { TaskList } from "~/app/_components/tasktList"
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic"; 

export default async function Home() {
  await api.tasks.getInfiniteTasks.prefetchInfinite({ limit: 4 });
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#001994] to-[#FF0066] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(336,100%,50%)]">TASKS</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
            </p>
          </div>

          <div className="w-full max-w-xs">
            <CreateTaskForm />
          </div>
          <div className="w-full max-w-xs">
            <TaskList />
          </div>

        
        </div>
      </main>
    </HydrateClient>
  );
}
