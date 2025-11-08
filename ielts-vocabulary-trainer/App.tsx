
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExerciseArea } from './components/ExerciseArea';
import { vocabCategories } from './data/vocab';
import type { VocabCategory } from './types';

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const selectedWords = useMemo(() => {
    return vocabCategories
      .filter(cat => selectedCategories.includes(cat.category))
      .flatMap(cat => cat.words);
  }, [selectedCategories]);

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <div className="relative flex min-h-screen">
        <Sidebar
          categories={vocabCategories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">IELTS Vocabulary Trainer</h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
          <ExerciseArea selectedWords={selectedWords} />
        </main>
      </div>
    </div>
  );
}
