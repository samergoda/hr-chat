import { useEffect, useRef, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSelectedEmployee } from '@/context/useSelectedEmployee';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

interface EmployeeListProps {
  onSelect: (employee: { id: string; employeeName: string }) => void;
  selected: { id: string; employeeName: string };
}

export default function EmployeeList({ onSelect, selected: propSelected }: EmployeeListProps) {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const prevCountRef = useRef<number>(0);
  const firstLoadRef = useRef(true);

  // Context
  const { selectedEmployee, setSelectedEmployee } = useSelectedEmployee();
  const selected = propSelected || selectedEmployee;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'feedback'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];

      prevCountRef.current = data.length;
      firstLoadRef.current = false;

      setEmployees(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => (e.employeeName || 'unknown').toLowerCase().includes(q));
  }, [employees, query]);

  if (loading) {
    return <div className="p-4 text-muted-foreground text-sm sm:text-base">Loading employees…</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="p-4 text-muted-foreground text-sm sm:text-base">No employees found.</div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur ">
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3">
          <div className="">
            {/* Title */}
            <h3 className="text-base font-semibold sm:text-lg">Employees</h3>
            <p className="text-sm text-muted-foreground">Click to chat</p>
          </div>

          {/* Length of employees */}
          <span className="ml-auto text-xs text-muted-foreground sm:text-sm">
            {filtered.length}/{employees.length}
          </span>
        </div>

        {/* Search */}
        <div className="px-3 pb-2 sm:px-4 sm:pb-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="block w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary sm:text-base"
          />
        </div>
      </div>

      {/* Employee list */}
      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-border">
          {filtered.map((employee) => {
            const isActive = selected?.id === employee.id;
            const name = employee.employeeName || 'Unknown';
            const dateStr = employee.date?.seconds
              ? new Date(employee.date.seconds * 1000).toLocaleString()
              : 'Unknown';

            return (
              <li key={employee.id}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start rounded-none text-left p-6 py-10 gap-3',
                    isActive && 'bg-secondary text-secondary-foreground',
                  )}
                  onClick={() => {
                    const sel = { id: employee.id, employeeName: name };
                    setSelectedEmployee(sel);
                    onSelect?.(sel);
                  }}
                >
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 sm:h-8 sm:w-8">
                    <AvatarFallback className="text-sm sm:text-xs">
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    {/* Name */}
                    <span className="block truncate text-base font-medium sm:text-sm">{name}</span>
                    {/* Date*/}
                    <span className="block truncate text-xs text-muted-foreground sm:text-xs">
                      {dateStr}
                    </span>
                  </div>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
