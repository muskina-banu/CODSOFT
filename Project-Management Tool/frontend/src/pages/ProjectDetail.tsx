import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetProject, useGetProjectProgress, useListProjectTasks,
  useUpdateProject, useDeleteProject, useCreateTask, useUpdateTask, useDeleteTask,
  useListMembers,
  getGetProjectQueryKey, getListProjectTasksQueryKey, getGetProjectProgressQueryKey,
  getListProjectsQueryKey
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft, Pencil } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

const columns = [
  { key: "todo", label: "Todo", color: "bg-gray-200 text-gray-700" },
  { key: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { key: "in_review", label: "In Review", color: "bg-purple-100 text-purple-700" },
  { key: "done", label: "Done", color: "bg-green-100 text-green-700" },
];

const priorityDot: Record<string, string> = {
  low: "bg-green-400", medium: "bg-yellow-400", high: "bg-orange-400", urgent: "bg-red-500",
};

type Task = {
  id: string; title: string; status: string; priority: string;
  projectId: string; assigneeId?: string | null; assigneeName?: string | null;
  dueDate?: string | null; createdAt: string;
};

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: project, isLoading: projectLoading } = useGetProject(id, { query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) } });
  const { data: tasks, isLoading: tasksLoading } = useListProjectTasks(id, { query: { enabled: !!id, queryKey: getListProjectTasksQueryKey(id) } });
  const { data: progress } = useGetProjectProgress(id, { query: { enabled: !!id, queryKey: getGetProjectProgressQueryKey(id) } });
  const { data: members } = useListMembers();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const taskForm = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", status: "todo", priority: "medium", dueDate: "" },
  });

  function invalidateProject() {
    queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListProjectTasksQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getGetProjectProgressQueryKey(id) });
  }

  function openNewTask(status: string) {
    setEditTask(null);
    taskForm.reset({ title: "", status: status as TaskForm["status"], priority: "medium" });
    setTaskDialogOpen(true);
  }

  function openEditTask(task: Task) {
    setEditTask(task);
    taskForm.reset({
      title: task.title,
      status: task.status as TaskForm["status"],
      priority: task.priority as TaskForm["priority"],
      assigneeId: task.assigneeId ?? undefined,
      dueDate: task.dueDate ?? "",
    });
    setTaskDialogOpen(true);
  }

  function onTaskSubmit(values: TaskForm) {
    const data = {
      title: values.title,
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
      projectId: id,
    };
    if (editTask) {
      updateTask.mutate({ id: editTask.id, data }, {
        onSuccess: () => { invalidateProject(); setTaskDialogOpen(false); toast({ title: "Task updated" }); },
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      });
    } else {
      createTask.mutate({ data }, {
        onSuccess: () => { invalidateProject(); setTaskDialogOpen(false); taskForm.reset(); toast({ title: "Task created" }); },
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      });
    }
  }

  function handleDeleteTask(taskId: string) {
    deleteTask.mutate({ id: taskId }, {
      onSuccess: () => { invalidateProject(); toast({ title: "Task deleted" }); },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  }

  function handleUpdateStatus(taskId: string, status: string) {
    updateTask.mutate({ id: taskId, data: { status } }, {
      onSuccess: () => invalidateProject(),
    });
  }

  function handleDeleteProject() {
    if (!confirm("Delete this project and all its tasks?")) return;
    deleteProject.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        setLocation("/projects");
        toast({ title: "Project deleted" });
      },
    });
  }

  if (projectLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/projects"><a className="text-primary text-sm underline mt-2 block">Back to projects</a></Link>
      </div>
    );
  }

  const progressPct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/projects">
            <a className="mt-1 p-1.5 rounded hover:bg-muted transition-colors">
              <ArrowLeft size={16} />
            </a>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color ?? "#7c3aed" }} />
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            </div>
            {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground">Status: <strong>{project.status.replace("_", " ")}</strong></span>
              {project.dueDate && <span className="text-xs text-muted-foreground">Due: <strong>{project.dueDate}</strong></span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const statuses = ["planning", "active", "on_hold", "completed"] as const;
              const next = statuses[(statuses.indexOf(project.status as typeof statuses[number]) + 1) % statuses.length];
              updateProject.mutate({ id, data: { status: next } }, {
                onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) }); }
              });
            }}
          >
            <Pencil size={13} className="mr-1" /> Edit Status
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleDeleteProject}>
            <Trash2 size={13} className="mr-1" /> Delete
          </Button>
        </div>
      </div>

      {progress && progress.total > 0 && (
        <div className="bg-card border border-card-border rounded-lg px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{progress.done}/{progress.total} done ({progressPct}%)</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-2 bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>Todo: {progress.todo}</span>
            <span>In Progress: {progress.inProgress}</span>
            <span>In Review: {progress.inReview}</span>
            <span>Done: {progress.done}</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-[800px]">
          {columns.map(col => {
           const colTasks = (tasks ?? []).filter((t: Task) => t.status === col.key);
            return (
              <div key={col.key} className="flex-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${col.color}`}>{col.label}</span>
                    <span className="text-xs text-muted-foreground">{colTasks.length}</span>
                  </div>
                  <button onClick={() => openNewTask(col.key)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {tasksLoading ? (
                    [...Array(2)].map((_, i) => <div key={i} className="h-20 bg-card border border-card-border rounded-lg animate-pulse" />)
                  ) : colTasks.map(task => (
                    <div key={task.id} className="bg-card border border-card-border rounded-lg p-3 group hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium text-foreground leading-snug flex-1">{task.title}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditTask(task as Task)} className="p-0.5 hover:bg-muted rounded">
                            <Pencil size={11} />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)} className="p-0.5 hover:bg-destructive/10 rounded text-destructive">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${priorityDot[task.priority] ?? "bg-gray-300"}`} />
                          <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                        </div>
                        {task.dueDate && <span className="text-xs text-muted-foreground">{task.dueDate}</span>}
                      </div>
                      {task.assigneeName && (
                        <p className="text-xs text-muted-foreground mt-1.5 truncate">{task.assigneeName}</p>
                      )}
                      <Select value={task.status} onValueChange={v => handleUpdateStatus(task.id, v)}>
                        <SelectTrigger className="h-6 text-xs mt-2 border-dashed"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {!tasksLoading && colTasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors" onClick={() => openNewTask(col.key)}>
                      + Add task
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={taskDialogOpen} onOpenChange={open => { setTaskDialogOpen(open); if (!open) setEditTask(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onTaskSubmit)} className="space-y-4 mt-2">
              <FormField control={taskForm.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Task title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={taskForm.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={taskForm.control} name="priority" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={taskForm.control} name="assigneeId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select value={field.value || "none"} onValueChange={v => field.onChange(v === "none" ? undefined : v)}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {(members ?? []).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={taskForm.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full" disabled={createTask.isPending || updateTask.isPending}>
                {createTask.isPending || updateTask.isPending ? "Saving..." : editTask ? "Update Task" : "Create Task"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}