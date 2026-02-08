
import React, { useState } from 'react';
import { AppProvider, useApp } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { WorkoutLogger } from './views/WorkoutLogger';
import { History } from './views/History';
import { ExerciseLibrary } from './views/ExerciseLibrary';
import { Stats } from './views/Stats';
import { PRsView } from './views/PRsView';
import { MeasurementsView } from './views/MeasurementsView';
import { PhotosView } from './views/PhotosView';

const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');

  const renderView = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard onNavigate={setCurrentPath} />;
      case '/log':
        return <WorkoutLogger onComplete={() => setCurrentPath('/history')} />;
      case '/history':
        return <History />;
      case '/exercises':
        return <ExerciseLibrary />;
      case '/stats':
        return <Stats />;
      case '/prs':
        return <PRsView onBack={() => setCurrentPath('/')} />;
      case '/measurements':
        return <MeasurementsView onBack={() => setCurrentPath('/')} />;
      case '/photos':
        return <PhotosView onBack={() => setCurrentPath('/')} />;
      default:
        return <Dashboard onNavigate={setCurrentPath} />;
    }
  };

  return (
    <Layout currentPath={currentPath} onNavigate={setCurrentPath}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
