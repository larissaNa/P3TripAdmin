import { Toaster } from "./view/components/ui/toaster";
import { Toaster as Sonner } from "./view/components/ui/sonner";
import { TooltipProvider } from "./view/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./view/Index";
import NotFound from "./view/NotFound";
import Auth from "./view/components/Auth";
import { ProtectedRoute } from "./view/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute requireAdmin={false}>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
