import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import PagesList from './pages/PagesList';
import PageForm from './pages/PageForm';
import { Page } from './types';

type View = 'list' | 'create' | 'edit';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>('list');
  const [selectedPage, setSelectedPage] = useState<Page | undefined>();

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleCreatePage = () => {
    setSelectedPage(undefined);
    setView('create');
  };

  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setView('edit');
  };

  const handleBack = () => {
    setSelectedPage(undefined);
    setView('list');
  };

  const handleSuccess = () => {
    setSelectedPage(undefined);
    setView('list');
  };

  if (view === 'create' || view === 'edit') {
    return (
      <PageForm
        page={selectedPage}
        onBack={handleBack}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <PagesList
      onCreatePage={handleCreatePage}
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
