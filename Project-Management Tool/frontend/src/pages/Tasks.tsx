import { useState } from "react";
import {
  useListTasks, useCreateTask, useUpdateTask, useDeleteTask,
  useListProjects, useListMembers,
  getListTasksQueryKey
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, CheckSquare, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600 border-gray-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  in_review: "bg-purple-100 text-purple-700 border-purple-200",
  done: "bg-green-100 text-green-700 border-green-200",
};
const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

type Task = {
  id: string; title: string; description?: string | null;
  status: string; priority: string; projectId: string;
  assigneeId?: string | null; assigneeName?: string | null;
  projectName?: string | null; dueDate?: string | null; createdAt: string;
};

function TaskRow({ task, onEdit, onDelete }: { task: Task; onEdit: (t: Task) => void; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.projectName && <span className="text-xs text-muted-foreground">{task.projectName}</span>}
          {task.assigneeName && <span className="text-xs text-muted-foreground">· {task.assigneeName}</span>}
          {task.dueDate && <span className="text-xs text-muted-foreground">· Due {task.dueDate}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${priorityColors[task.priority] ?? ""}`}>
          {task.priority}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColors[task.status] ?? ""}`}>
          {task.status.replace("_", " ")}
        </span>
        <button onClick={() => onEdit(task)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all text-destructive">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function TaskFormDialog({
  open, onOpenChange, editTask, projects, members
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editTask?: Task | null;
  projects: { id: string; name: string }[];
  members: { id: string; name: string }[];
}) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: editTask ? {
      title: editTask.title,
      description: editTask.description ?? "",
      status: editTask.status as TaskForm["status"],
      priority: editTask.priority as TaskForm["priority"],
      projectId: editTask.projectId,
      assigneeId: editTask.assigneeId ?? undefined,
      dueDate: editTask.dueDate ?? "",
    } : { title: "", description: "", status: "todo", priority: "medium", projectId: "", dueDate: "" },
  });

  function onSubmit(values: TaskForm) {
    const data = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      projectId: values.projectId,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
    };

    const invalidate = () => { queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() }); };

    if (editTask) {
      updateTask.mutate({ id: editTask.id, data }, {
        onSuccess: () => { invalidate(); onOpenChange(false); toast({ title: "Task updated" }); },
        onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
      });
    } else {
      createTask.mutate({ data }, {
        onSuccess: () => { invalidate(); onOpenChange(false); form.reset(); toast({ title: "Task created" }); },
        onError: () => toast({ title: "Failed to create task", variant: "destructive" }),
      });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editTask ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Task title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Optional description" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="projectId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="assigneeId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select value={field.value || "none"} onValueChange={v => field.onChange(v === "none" ? undefined : v)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
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
              <FormField control={form.control} name="priority" render={({ field }) => (
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
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving..." : editTask ? "Update Task" : "Create Task"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Tasks() {
  const { data: tasks, isLoading } = useListTasks();
  const { data: projects } = useListProjects();
  const { data: members } = useListMembers();
  const deleteTask = useDeleteTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  function handleEdit(task: Task) { setEditTask(task); setDialogOpen(true); }
  function handleDelete(id: string) {
    deleteTask.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() }); toast({ title: "Task deleted" }); },
      onError: () => toast({ title: "Failed to delete task", variant: "destructive" }),
    });
  }

  const filtered = ((tasks ?? []) as Task[]).filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} tasks</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setEditTask(null); setDialogOpen(true); }}>
          <Plus size={15} /> New Task
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-card-border rounded-lg px-5">
        {isLoading ? (
          <div className="space-y-3 py-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map(t => <TaskRow key={t.id} task={t as Task} onEdit={handleEdit} onDelete={handleDelete} />)
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <CheckSquare size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tasks found</p>
            <p className="text-sm mt-1">Create a task or adjust your filters.</p>
          </div>
        )}
      </div>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={open => { setDialogOpen(open); if (!open) setEditTask(null); }}
        editTask={editTask}
        projects={projects ?? []}
        members={members ?? []}
      />
    </div>
  );
}