import React, { useState, createContext, useContext, ReactNode } from 'react';

// Tabs Context
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
};

// Tabs Root Component
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = ''
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);
  
  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList Component
interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`tabs-list flex space-x-1 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// TabsTrigger Component
interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
  disabled = false
}) => {
  const { activeTab, setActiveTab } = useTabsContext();
  
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={`tabs-trigger px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
        isActive
          ? 'border-blue-500 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
};

// TabsContent Component
interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = ''
}) => {
  const { activeTab } = useTabsContext();
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div className={`tabs-content pt-4 ${className}`}>
      {children}
    </div>
  );
};

// Export all components
export default Tabs;