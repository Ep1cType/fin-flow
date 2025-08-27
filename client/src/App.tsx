import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import Categories from "@/pages/categories";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-full shadow-lg px-4 py-2 flex gap-2">
        <Button
          variant={location === "/" ? "default" : "ghost"}
          size="sm"
          asChild
          className="rounded-full"
          data-testid="nav-dashboard"
        >
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Главная
          </Link>
        </Button>
        <Button
          variant={location === "/categories" ? "default" : "ghost"}
          size="sm"
          asChild
          className="rounded-full"
          data-testid="nav-categories"
        >
          <Link href="/categories">
            <Settings className="w-4 h-4 mr-2" />
            Категории
          </Link>
        </Button>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/categories" component={Categories} />
        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
