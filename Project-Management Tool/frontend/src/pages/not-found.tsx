import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">This page doesn't exist.</p>
      <Link href="/"><a className="text-primary underline text-sm">Go back home</a></Link>
    </div>
  );
}
