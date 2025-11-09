import { useContext } from 'react';
import SelectedEmployeeContext from './SelectedEmployeeContext';

export function useSelectedEmployee() {
  const context = useContext(SelectedEmployeeContext);
  if (context === undefined) {
    throw new Error('useSelectedEmployee must be used within a SelectedEmployeeProvider');
  }
  return context;
}
