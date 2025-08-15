"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApiClient } from "@/lib/authApi";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, X, Star, Trash2 } from "lucide-react";
import Image from "next/image";


type Todo = {
  id: string;
  item: string;
  isDone: boolean;
};

export default function TodoPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [newTodoText, setNewTodoText] = useState("");
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "done" | "undone">(
    "all"
  );
  const queryClient = useQueryClient();

  
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos", filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus === "done") {
        params.append("filters", '{"isDone":true}');
      } else if (filterStatus === "undone") {
        params.append("filters", '{"isDone":false}');
      }
      const { data } = await authApiClient.get("/todos", { params });
      
      return data.content.entries as Todo[];
    },
  });

  
  const createTodoMutation = useMutation({
    mutationFn: (newItem: string) => {
      return authApiClient.post("/todos", { item: newItem });
    },
    onSuccess: () => {
      toast.success("Todo baru berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodoText("");
    },
    onError: () => {
      toast.error("Gagal membuat todo.");
    },
  });

  
  const markTodoMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "DONE" | "UNDONE" }) => {
      return authApiClient.put(`/todos/${id}/mark`, { action });
    },
    onSuccess: () => {
      toast.success("Status Todo berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: () => {
      toast.error("Gagal memperbarui status todo.");
    },
  });

  
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => {
      return authApiClient.delete("/todos/bulk-delete", { data: { ids } });
    },
    onSuccess: () => {
      toast.success("Todos berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: () => {
      toast.error("Gagal menghapus todos.");
    },
  });

 
  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      createTodoMutation.mutate(newTodoText);
    }
  };

  const handleMarkTodo = (id: string, isDone: boolean) => {
    const action = isDone ? "UNDONE" : "DONE";
    markTodoMutation.mutate({ id, action });
  };

  const handleToggleSelectTodo = (id: string, checked: boolean) => {
    setSelectedTodos((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSingleDeleteTodo = (id: string) => {
   
    bulkDeleteMutation.mutate([id]);
  };

  const handleDeleteSelected = () => {
    if (selectedTodos.size > 0) {
      if (
        window.confirm(
          `Apakah Anda yakin ingin menghapus ${selectedTodos.size} item terpilih?`
        )
      ) {
        bulkDeleteMutation.mutate(Array.from(selectedTodos), {
          onSuccess: () => {
            setSelectedTodos(new Set());
          },
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center bg-white border-b px-8 py-3 shadow-sm">
        <div className="flex items-center space-x-2 text-gray-500">
          <Star className="h-5 w-5" />
          <Input
            placeholder="Search (Ctrl+/)"
            className="border-none focus:ring-0 shadow-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-lg">
            {user?.fullName || "Pengguna"}
          </span>
          
          <Image
            src="/avatar.png"
            alt="Avatar"
            width={52}
            height={52}
            className="w-13 h-13 rounded-full"
          />
          <Button onClick={handleLogout} variant="ghost">
            Logout
          </Button>
        </div>
      </header>

     
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-center text-3xl font-bold mt-8 mb-4">To Do</h1>

        <Card className="shadow-lg">
          <CardContent>
           
            <div className="flex space-x-2 mb-4 justify-center">
              <Button
                onClick={() => setFilterStatus("all")}
                variant={filterStatus === "all" ? "default" : "outline"}
              >
                All
              </Button>
              <Button
                onClick={() => setFilterStatus("done")}
                variant={filterStatus === "done" ? "default" : "outline"}
              >
                Done
              </Button>
              <Button
                onClick={() => setFilterStatus("undone")}
                variant={filterStatus === "undone" ? "default" : "outline"}
              >
                Undone
              </Button>
            </div>

            
            <form onSubmit={handleCreateTodo} className="flex space-x-2 mb-4">
              <Input
                placeholder="Add a new task"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                disabled={createTodoMutation.isPending}
              />
              <Button type="submit" disabled={createTodoMutation.isPending}>
                {createTodoMutation.isPending ? "Adding..." : "Add Todo"}
              </Button>
            </form>

            
            <ul className="space-y-2">
              {todos?.map((todo: Todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={selectedTodos.has(todo.id)}
                      onCheckedChange={(checked) =>
                        handleToggleSelectTodo(todo.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`todo-${todo.id}`}
                      className={`flex-1 ${
                        todo.isDone ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {todo.item}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkTodo(todo.id, todo.isDone)}
                    >
                      {todo.isDone ? (
                        <X className="h-5 w-5 text-red-500" />
                      ) : (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSingleDeleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              variant="destructive"
              className="mt-4"
              onClick={handleDeleteSelected}
              disabled={selectedTodos.size === 0 || bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending
                ? "Deleting..."
                : `Delete Selected (${selectedTodos.size})`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}