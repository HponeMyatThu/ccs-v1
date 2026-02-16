import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import PagesList from "./pages/PagesList";
import PageForm from "./pages/PageForm";
import { Page } from "./types";
import AgentSupportList from "./pages/AgentSupportList";
import DetailForm from "./pages/DetailForm";
import { apiService } from "./services/api";

type View = "list" | "create" | "edit" | "agent_list" | "detail";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>("list");
  const [selectedPage, setSelectedPage] = useState<Page | undefined>();
  const [page, setPage]= useState<Page| undefined>();
  const [pageContents, setPageContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Added this

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleCreatePage = () => {
    setSelectedPage(undefined);
    setView("create");
  };

  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setView("edit");
  };

const handleViewDetail = async (page: Page) => {
  setLoading(true); // Start Loading
  setSelectedPage(page);
  
  try {
    const pageData = await apiService.getPage(page.id);
     setPage(pageData);
    // Find content with ref_id = page.id
    const data = await apiService.getContentsByRef(page.id);
    setPageContents(data || []);

    setView("detail");
  } catch (error) {
    console.error("Error loading page details:", error);
    alert("Failed to load content.");
  } finally {
    setLoading(false); // Stop Loading regardless of success or failure
  }
};

  const handleAgentSupportPage = () => {
    setSelectedPage(undefined);
    setView("agent_list");
  };

  const handleBack = () => {
    setSelectedPage(undefined);
    setView("list");
  };

  const handleSuccess = () => {
    setSelectedPage(undefined);
    setView("list");
  };

  if (view === "create" || view === "edit") {
    return (
      <PageForm
        page={selectedPage}
        onBack={handleBack}
        onSuccess={handleSuccess}
      />
    );
  }

if (view === "agent_list") {
  return (
    <AgentSupportList 
      onCreatePage={handleCreatePage}
      onEditPage={handleEditPage}
      onBackAgentPage={handleAgentSupportPage}
      onDetailPage={handleViewDetail}
    />
  );
}
if (view === "detail") {
  return (
    <DetailForm 
      onBackAgentPage={handleAgentSupportPage}
      pages={page} 
      contents={pageContents} 
      
    />
  );
}
  return (
    <PagesList
      onCreatePage={handleCreatePage}
      onAgentSupportPage={handleAgentSupportPage}
      onEditPage={handleEditPage}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
