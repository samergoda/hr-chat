import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Employee {
  id: string;
  employeeName: string;
  date?: { seconds: number };
}

interface EmployeeListProps {
  onSelect: (id: string) => void;
  selected: string | null;
}

export default function EmployeeList({ onSelect, selected }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Track the number of employees/messages previously loaded
  const prevCountRef = useRef<number>(0);
  const firstLoadRef = useRef(true); // prevents toast on first load

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "feedback"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];

      //  Handle new messages only after the first snapshot
      if (!firstLoadRef.current && data.length > prevCountRef.current) {
        toast.success("You have a new message");
      }

      prevCountRef.current = data.length;
      firstLoadRef.current = false;

      setEmployees(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Loading state
  if (loading) {
    return <div className="p-4 text-gray-500">Loading employees…</div>;
  }

  // Empty state
  if (employees.length === 0) {
    return <div className="p-4 text-gray-500">No employees found.</div>;
  }

  return (
    <div className="h-full overflow-auto">
      <ul className="divide-y">
        {employees.map((employee) => {
          const isActive = selected === employee.id;
          return (
            <li key={employee.id}>
              <button
                onClick={() => onSelect(employee.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                  isActive ? "bg-gray-100 font-medium" : ""
                }`}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {employee.employeeName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    {/* Employee name */}
                    <div className="text-sm">{employee.employeeName || "Unknown"}</div>

                    {/* Date */}
                    <div className="text-xs text-gray-500">
                      {employee.date?.seconds ? new Date(employee.date.seconds * 1000).toLocaleString() : "Unknown"}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
