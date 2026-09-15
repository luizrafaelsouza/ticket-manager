import { useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { NewTicketPage } from "./pages/NewTicketPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TicketListPage } from "./pages/TicketListPage";
import { TicketStatusPage } from "./pages/TicketStatusPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";

type View = "dashboard" | "new-ticket" | "list" | "status";

function AppContent() {
  const [view, setView] = useState<View>("dashboard");
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="mx-auto mt-16 text-center text-slate-600">Loading...</p>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {view === "dashboard" && <DashboardPage onNavigate={setView} />}
        {view === "new-ticket" && (
          <NewTicketPage onDone={() => setView("dashboard")} onBack={() => setView("dashboard")} />
        )}
        {view === "list" && <TicketListPage onBack={() => setView("dashboard")} />}
        {view === "status" && <TicketStatusPage onBack={() => setView("dashboard")} />}
      </main>
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
