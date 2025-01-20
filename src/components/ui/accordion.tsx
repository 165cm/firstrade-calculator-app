import React, { createContext, useContext, useState } from 'react';

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionItemContext = createContext<{ value: string } | null>(null);

const AccordionContext = createContext<AccordionContextType>({
  openItems: [],
  toggleItem: () => {},
});

interface AccordionProps {
  type?: 'single' | 'multiple';
  children: React.ReactNode;
  className?: string;
  defaultValue?: string; // 追加
}

export function Accordion({ 
  type = 'single', 
  children, 
  className = '',
  defaultValue = ''  // 追加
}: AccordionProps) {
  // 初期値として defaultValue を使用
  const [openItems, setOpenItems] = useState<string[]>(
    defaultValue ? [defaultValue] : []
  );

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter(item => item !== value)
          : [...openItems, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`divide-y divide-gray-200 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ 
    value, 
    children, 
    className = '' 
  }: AccordionItemProps) {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div className={`border-b border-gray-200 ${className}`}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
  
interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ 
  children, 
  className = '' 
}: AccordionTriggerProps) {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }

  const isOpen = openItems.includes(itemContext.value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(itemContext.value)}
      className={`
        w-full flex justify-between items-center px-4 py-4 text-left
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronIcon className={`
        w-5 h-5 transform transition-transform duration-200
        ${isOpen ? 'rotate-180' : ''}
      `} />
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ 
  children, 
  className = '' 
}: AccordionContentProps) {
  const { openItems } = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }

  const isOpen = openItems.includes(itemContext.value);

  return (
    <div
      className={`
        overflow-hidden transition-all duration-200 ease-in-out
        ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
        ${className}
      `}
    >
      <div className="px-4 py-4">
        {children}
      </div>
    </div>
  );
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}