type ChatCardProps = {
  employee: Employee;
  onSelect: (id: string | number) => void;
  isActive?: boolean;
};

export default function ChatCard({ employee, onSelect, isActive }: ChatCardProps) {
  return (
    <li key={employee.id}>
      <button
        onClick={() => onSelect(employee.id)}
        className={`w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${isActive ? "bg-gray-100 font-medium" : ""}`}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
            {employee.employeeName?.charAt(0).toLocaleUpperCase() || "??"}
          </div>
          <div>
            {/* Employee name */}
            <div className="text-sm">{employee.employeeName || "Unknown"}</div>

            {/* Date */}
            <div className="text-xs text-gray-500">{new Date(employee.date?.seconds * 1000).toLocaleString() || "Unknown"}</div>
          </div>
        </div>
      </button>
    </li>
  );
}
