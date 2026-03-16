import LoginButton from "@/components/LoginButton";
import { Leaf } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <header className="px-6 py-6 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-foreground p-1.5 rounded-xl">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Plantry
          </span>
        </div>
        <div>
          <LoginButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-24 pb-32">
        <div className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/5 px-3 py-1 text-sm text-secondary mb-8 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-secondary mr-2"></span>
          AI-powered pantry & meal planning
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-3xl mb-6">
          Cook what you <br className="hidden md:block" /> already have.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Stop throwing away expired food and struggling to decide what to cook. Plantry tracks your ingredients and generates delicious recipes instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <LoginButton />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/4 right-0 translate-x-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      </main>
    </div>
  );
}
