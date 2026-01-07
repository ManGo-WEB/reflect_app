
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { CategoryManager } from './components/CategoryManager';
import { EntryModal } from './components/EntryModal';
import { ToastContainer } from './components/Toast';
import { useJournal } from './store/useJournal';
import { useToast } from './hooks/useToast';
import { ViewMode, Entry } from './types';
import { LayoutDashboard, Brain, Settings, Plus } from 'lucide-react';

const App: React.FC = () => {
  const { entries, categories, reports, addEntry, updateEntry, deleteEntry, addCategory, updateCategory, deleteCategory, addReport } = useJournal();
  const { toasts, removeToast, showError } = useToast();
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const handleSubmitEntry = (text: string, categoryId: string, date: string, entryId?: string) => {
    if (entryId) {
      // Режим редактирования
      updateEntry(entryId, text, categoryId, date);
    } else {
      // Режим создания
      addEntry(text, categoryId, date);
    }
    setIsEntryModalOpen(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteEntry(entryId);
  };

  const handleCloseModal = () => {
    setIsEntryModalOpen(false);
    setEditingEntry(null);
  };

  const renderView = () => {
    switch (view) {
      case ViewMode.DASHBOARD:
        return (
          <Dashboard 
            entries={entries} 
            categories={categories}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        );
      case ViewMode.REPORTS:
        return <Reports entries={entries} categories={categories} reports={reports} onReportGenerated={addReport} />;
      case ViewMode.CATEGORIES:
        return <CategoryManager categories={categories} onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} />;
      default:
        return (
          <Dashboard 
            entries={entries} 
            categories={categories}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FAFAFA] text-[rgba(0,0,0,0.87)]">
      {/* Top Navbar */}
      <nav className="flex-shrink-0 bg-white elevation-2 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1976D2] rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          <span className="font-medium text-xl text-[rgba(0,0,0,0.87)]">Reflect</span>
        </div>
        
        <div className="hidden md:flex gap-1">
          {[
            { id: ViewMode.DASHBOARD, label: 'Дневник', icon: LayoutDashboard },
            { id: ViewMode.REPORTS, label: 'Аналитика', icon: Brain },
            { id: ViewMode.CATEGORIES, label: 'Контексты', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-all ripple ${
                view === item.id 
                  ? 'bg-[#1976D2] text-white elevation-1' 
                  : 'text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="md:w-32 flex justify-end" />
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {renderView()}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:hidden bg-white elevation-8 rounded-lg p-2 flex justify-between items-center z-50">
        <button 
          onClick={() => setView(ViewMode.DASHBOARD)}
          className={`p-3 rounded-lg transition-all ripple ${
            view === ViewMode.DASHBOARD 
              ? 'bg-[#1976D2] text-white' 
              : 'text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]'
          }`}
        >
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setIsEntryModalOpen(true)}
          className="p-4 bg-[#1976D2] text-white rounded-full elevation-4 -translate-y-4 transition-all active:scale-95 ripple"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setView(ViewMode.REPORTS)}
          className={`p-3 rounded-lg transition-all ripple ${
            view === ViewMode.REPORTS 
              ? 'bg-[#1976D2] text-white' 
              : 'text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]'
          }`}
        >
          <Brain className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop FAB */}
      <button 
        onClick={() => setIsEntryModalOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-[#1976D2] text-white rounded-full items-center justify-center elevation-8 hover:elevation-16 transition-all active:scale-95 z-50 ripple"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Entry Modal */}
      <EntryModal 
        isOpen={isEntryModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        onSubmit={handleSubmitEntry}
        entry={editingEntry}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Tailwind safelist for dynamic colors */}
      <div className="hidden border-blue-500 border-green-500 border-red-500 border-yellow-500 border-purple-500 border-orange-500 border-pink-500 border-teal-500 border-indigo-500 bg-blue-100 bg-green-100 bg-red-100 bg-yellow-100 bg-purple-100 bg-orange-100 bg-pink-100 bg-teal-100 bg-indigo-100 text-blue-600 text-green-600 text-red-600 text-yellow-600 text-purple-600 text-orange-600 text-pink-600 text-teal-600 text-indigo-600 bg-blue-500 bg-green-500 bg-red-500 bg-yellow-500 bg-purple-500 bg-orange-500 bg-pink-500 bg-teal-500 bg-indigo-500" />
    </div>
  );
};

export default App;
