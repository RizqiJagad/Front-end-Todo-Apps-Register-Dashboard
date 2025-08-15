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

export default function TodoPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [newTodoText, setNewTodoText] = useState("");
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "done" | "undone">(
    "all"
  );
  const queryClient = useQueryClient();

  // Fetch todos
  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos", filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus === "done") {
        params.append("filters", '{"isDone":true}');
      } else if (filterStatus === "undone") {
        params.append("filters", '{"isDone":false}');
      }
      const { data } = await authApiClient.get("/todos", { params });
      return data.content.entries;
    },
  });

  // Create todo
  const createTodoMutation = useMutation({
    mutationFn: (newItem: string) => {
      return authApiClient.post("/todos", { item: newItem });
    },
    onSuccess: () => {
      toast.success("Todo baru berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodoText("");
    },
  });

  // Mark todo
  const markTodoMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "DONE" | "UNDONE" }) => {
      return authApiClient.put(`/todos/${id}/mark`, { action });
    },
    onSuccess: () => {
      toast.success("Status Todo berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Delete todo
  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => {
      return authApiClient.delete(`/todos/${id}`);
    },
    onSuccess: () => {
      toast.success("Todo berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => {
      console.error("Gagal menghapus todo:", error);
      toast.error("Gagal menghapus todo. Token mungkin tidak valid.");
    },
  });

  // Handlers
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
    deleteTodoMutation.mutate(id);
  };

  const handleDeleteSelected = () => {
    if (selectedTodos.size > 0) {
      if (
        window.confirm(
          `Apakah Anda yakin ingin menghapus ${selectedTodos.size} item terpilih?`
        )
      ) {
        selectedTodos.forEach((id) => {
          deleteTodoMutation.mutate(id);
        });
        setSelectedTodos(new Set());
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
          <img
            src="/avatar.png"
            alt="Avatar"
            className="w-20 h-13 rounded-full"
          />
          <Button onClick={handleLogout} variant="ghost">
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-center text-3xl font-bold mt-8 mb-4">To Do</h1>

        <Card className="shadow-lg">
          <CardContent>
            {/* Filter buttons */}
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

            {/* Create todo form */}
            <form onSubmit={handleCreateTodo} className="flex space-x-2 mb-4">
              <Input
                placeholder="Add a new task"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
              />
              <Button type="submit">Add Todo</Button>
            </form>

            {/* Todo list */}
            <ul className="space-y-2">
              {todos?.map((todo: any) => (
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

            {/* Delete selected button */}
            <Button
              variant="destructive"
              className="mt-4"
              onClick={handleDeleteSelected}
              disabled={selectedTodos.size === 0}
            >
              Delete Selected ({selectedTodos.size})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
