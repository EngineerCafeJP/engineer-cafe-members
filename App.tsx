
import React from 'react';
import Header from './components/Header';
import ProfileList from './components/ProfileList';
import CalendarView from './components/CalendarView';
import Footer from './components/Footer';
import QuickLinks from './components/QuickLinks';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <QuickLinks />
        <ProfileList />
        <CalendarView />
      </main>
      <Footer />
    </div>
  );
};

export default App;
