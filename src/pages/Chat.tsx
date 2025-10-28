import { useState } from "react";
import EmployeeList from "@/components/features/EmployeeList";
import ChatWindow from "@/components/features/ChatWindow";

export default function ChatPage() {
  // selected employee name string
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl rounded-lg mt-14 bg-white shadow-md overflow-hidden">
        <div className="flex h-[80vh] ">
          {/* Left column */}
          <div className="w-[30%] border-r">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Employees</h2>
              <p className="text-sm text-muted-foreground">Click to chat</p>
            </div>
            <EmployeeList onSelect={(name) => setSelectedEmployee(name)} selected={selectedEmployee} />
          </div>

          {/* Right column */}
          <div className="w-[70%]">
            <ChatWindow
              employeeName={selectedEmployee}
              // hr user is always 'HR' in this example
              hrSenderName="HR"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
