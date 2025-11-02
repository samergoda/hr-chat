import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// Create the context with a default value
const SelectedEmployeeContext = createContext<SelectedEmployeeContextType | undefined>(undefined);

// Provider component
export function SelectedEmployeeProvider({ children }: { children: ReactNode }) {
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    employeeName: string;
  } | null>(null);

  const clearSelectedEmployee = () => {
    setSelectedEmployee(null);
  };

  // Value object that will be passed to consumers
  const value = {
    selectedEmployee,
    setSelectedEmployee,
    clearSelectedEmployee,
  };

  return (
    <SelectedEmployeeContext.Provider value={value}>{children}</SelectedEmployeeContext.Provider>
  );
}

// Export the context
export default SelectedEmployeeContext;
