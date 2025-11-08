
import React from 'react';
import type { VocabCategory } from '../types';

interface SidebarProps {
  categories: VocabCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryName: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CategoryItem: React.FC<{ category: VocabCategory; isSelected: boolean; onToggle: () => void }> = ({ category, isSelected, onToggle }) => (
  <li className="flex items-center">
    <label className="flex items-center w-full p-2 rounded-md cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{category.category}</span>
      <span className="ml-auto text-xs font-mono px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200">{category.words.length}</span>
    </label>
  </li>
);


export const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategories, onCategoryToggle, isOpen, setIsOpen }) => {
  const totalWords = categories.reduce((sum, cat) => sum + cat.words.length, 0);

  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-80 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Word Categories</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total words: {totalWords}</p>
          </div>

          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            <ul className="space-y-1">
              {categories.map(cat => (
                <CategoryItem
                  key={cat.category}
                  category={cat}
                  isSelected={selectedCategories.includes(cat.category)}
                  onToggle={() => onCategoryToggle(cat.category)}
                />
              ))}
            </ul>
          </nav>
        </div>
      </aside>
       {isOpen && (
        <div 
            onClick={() => setIsOpen(false)} 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            aria-hidden="true"
        ></div>
      )}
    </>
  );
};
