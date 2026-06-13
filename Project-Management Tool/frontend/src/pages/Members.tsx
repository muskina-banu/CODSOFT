import { useState } from "react";
import { useListMembers, useCreateMember, getListMembersQueryKey } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Mail, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  role: z.string().optional(),
});
type MemberForm = z.infer<typeof memberSchema>;

function MemberCard({ member }: { member: { id: number; name: string; email: string; role?: string | null; avatarUrl?: string | null; createdAt: string } }) {
  const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div data-testid={`member-card-${member.id}`} className="bg-card border border-card-border rounded-lg p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <span className="text-primary font-bold text-sm">{initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-foreground">{member.name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Mail size={11} /> {member.email}
        </p>
        {member.role && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Briefcase size={11} /> {member.role}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Members() {
  const { data: members, isLoading } = useListMembers();
  const createMember = useCreateMember();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: "", email: "", role: "" },
  });

  function onSubmit(values: MemberForm) {
    createMember.mutate(
      { data: { name: values.name, email: values.email, role: values.role || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
          setOpen(false);
          form.reset();
          toast({ title: "Member added" });
        },
        onError: () => toast({ title: "Failed to add member", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{members?.length ?? 0} team members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-member" size="sm" className="gap-2">
              <UserPlus size={15} /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input data-testid="input-member-name" placeholder="Full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input data-testid="input-member-email" placeholder="email@example.com" type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role (optional)</FormLabel>
                    <FormControl><Input data-testid="input-member-role" placeholder="e.g. Developer, Designer" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button data-testid="button-submit-member" type="submit" className="w-full" disabled={createMember.isPending}>
                  {createMember.isPending ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-card border border-card-border rounded-lg animate-pulse" />)}
        </div>
      ) : members && members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => <MemberCard key={m.id} member={m} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No members yet</p>
          <p className="text-sm mt-1">Add your first team member to get started.</p>
        </div>
      )}
    </div>
  );
}
