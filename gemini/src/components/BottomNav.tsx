import React from 'react';
import type { ViewName } from '../../app';

interface BottomNavProps {
  setView: (view: ViewName) => void;
  currentView: ViewName;
}

export const BottomNav: React.FC<BottomNavProps> = ({ setView, currentView }) => {
  const NavItem = ({
    viewName,
    iconClass,
    label,
  }: {
    viewName: ViewName;
    iconClass: string;
    label: string;
  }) => {
    const isActive = currentView === viewName;
    const activeClass = isActive ? 'text-orange-500' : 'text-gray-400';

    return (
      <button
        className={`flex-1 flex flex-col items-center justify-center text-center transition-colors duration-200 ease-in-out focus:outline-none ${activeClass}`}
        onClick={() => setView(viewName)}
        aria-label={label}
      >
        <i className={`${iconClass} text-2xl`}></i>
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full flex justify-around items-center z-50 bg-[rgba(24,24,24,0.85)] backdrop-blur-lg border-t border-solid border-white/10"
      style={{
        paddingTop: '10px',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'calc(10px + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(10px + env(safe-area-inset-right, 0px))',
        minHeight: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Mapear itens principais do app para views da SPA */}
      <NavItem viewName="MainApp" iconClass="fas fa-home" label="Home" />
      <NavItem viewName="Progress" iconClass="fas fa-chart-line" label="Progresso" />
      <NavItem viewName="Diary" iconClass="fas fa-book" label="Diário" />
      <NavItem viewName="ExploreRecipes" iconClass="fas fa-utensils" label="Receitas" />
      <NavItem viewName="MoreOptions" iconClass="fas fa-cog" label="Mais" />
    </nav>
  );
};
