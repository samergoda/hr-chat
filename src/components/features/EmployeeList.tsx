import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { useSelectedEmployee } from '@/context/useSelectedEmployee';

interface EmployeeListProps {
  onSelect?: (employee: { id: string; employeeName: string }) => void;
  selected?: { id: string; employeeName: string };
}

export default function EmployeeList({ onSelect, selected: propSelected }: EmployeeListProps) {
  const { selectedEmployee, setSelectedEmployee } = useSelectedEmployee();
  const selected = propSelected || selectedEmployee;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const prevCountRef = useRef<number>(0);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'feedback'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];

      // if (!firstLoadRef.current && data.length > prevCountRef.current) {
      //   toast.success('You have a new message');
      // }

      prevCountRef.current = data.length;
      firstLoadRef.current = false;

      setEmployees(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading employees…</div>;
  }

  if (employees.length === 0) {
    return <div className="p-4 text-muted-foreground">No employees found.</div>;
  }

  return (
    <div className="h-full overflow-auto">
      <ul className="divide-y divide-border">
        {employees.map((employee) => {
          const isActive = selected?.id === employee.id;

          return (
            <li key={employee.id}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start px-4 py-3 h-auto rounded-none gap-3 text-left ${
                  isActive ? 'bg-secondary text-secondary-foreground' : ''
                }`}
                onClick={() => {
                  const selectedEmployee = {
                    id: employee.id,
                    employeeName: employee.employeeName,
                  };
                  setSelectedEmployee(selectedEmployee);
                  onSelect?.(selectedEmployee);
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {employee.employeeName?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{employee.employeeName || 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground">
                    {employee.date?.seconds
                      ? new Date(employee.date.seconds * 1000).toLocaleString()
                      : 'Unknown'}
                  </span>
                </div>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
