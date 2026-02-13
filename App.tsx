import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { POS } from './pages/POS';
import { ProductManagement } from './pages/ProductManagement';
import { CustomerManagement } from './pages/CustomerManagement';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

const MainApp: React.FC = () => {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('pos');

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'pos': return <POS />;
      case 'products': return <ProductManagement />;
      case 'customers': return <CustomerManagement />;
      case 'dashboard': return <Dashboard />;
      default: return <POS />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
};

export default App;