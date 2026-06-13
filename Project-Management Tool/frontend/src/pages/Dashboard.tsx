import { useGetOverviewStats, useGetUpcomingDeadlines, useListProjects } from "@/lib/hooks";
import { Link } from "wouter";
import { FolderOpen, CheckCircle2, AlertCircle, Clock, TrendingUp, Calendar } from "lucide-react";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof FolderOpen; color: string }) {
  return (
    <div data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`} className="bg-card border border-card-border rounded-lg p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const statusColors: Record<string, string> = {
  planning: "bg-gray-100 text-gray-600",
  active: "bg-blue-100 text-blue-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOverviewStats();
  const { data: deadlines, isLoading: deadlinesLoading } = useGetUpcomingDeadlines();
  const { data: projects, isLoading: projectsLoading } = useListProjects();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your workspace</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-lg p-5 h-20 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderOpen} color="bg-primary" />
          <StatCard label="Active Projects" value={stats.activeProjects} icon={TrendingUp} color="bg-blue-500" />
          <StatCard label="Total Tasks" value={stats.totalTasks} icon={CheckCircle2} color="bg-purple-500" />
          <StatCard label="Completed Tasks" value={stats.completedTasks} icon={CheckCircle2} color="bg-green-500" />
          <StatCard label="Overdue Tasks" value={stats.overdueTasks} icon={AlertCircle} color="bg-red-500" />
          <StatCard label="Due in 7 Days" value={stats.upcomingDeadlines} icon={Clock} color="bg-orange-500" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-primary" />
            <h2 className="font-semibold text-sm">Upcoming Deadlines</h2>
          </div>
          {deadlinesLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : deadlines && deadlines.length > 0 ? (
            <div className="space-y-2">
              {deadlines.slice(0, 6).map(task => (
                <div key={task.id} data-testid={`deadline-task-${task.id}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.projectName}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${priorityColors[task.priority] ?? ""}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-primary" />
              <h2 className="font-semibold text-sm">Recent Projects</h2>
            </div>
            <Link href="/projects"><a className="text-xs text-primary hover:underline">View all</a></Link>
          </div>
          {projectsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 5).map(project => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <a data-testid={`project-card-${project.id}`} className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color ?? "#7c3aed" }} />
                      <p className="text-sm font-medium truncate">{project.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-3 ${statusColors[project.status] ?? ""}`}>
                      {project.status.replace("_", " ")}
                    </span>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">No projects yet.</p>
              <Link href="/projects"><a className="text-xs text-primary hover:underline">Create your first project</a></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
