import EmployeeList from '@/components/features/EmployeeList';
import ChatWindow from '@/components/features/ChatWindow';
import { useSelectedEmployee } from '@/context/useSelectedEmployee';

export default function ChatPage() {
  const { selectedEmployee, setSelectedEmployee } = useSelectedEmployee();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl rounded-lg mt-14 bg-white shadow-md overflow-hidden">
        <div className="flex h-[80vh] ">
          {/* Left column */}
          <div className="w-[30%] border-r">
            <EmployeeList
              onSelect={setSelectedEmployee}
              selected={selectedEmployee || { id: '', employeeName: '' }}
            />
          </div>

          {/* Right column */}
          <div className="w-[70%]">
            <ChatWindow
              employee={selectedEmployee || { id: '', employeeName: '' }}
              // hr user is always 'HR' in this example
              hrSenderName="HR"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
