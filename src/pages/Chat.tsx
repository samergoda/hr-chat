import { useState } from 'react';
import EmployeeList from '@/components/features/EmployeeList';
import ChatWindow from '@/components/features/ChatWindow';
import { useSelectedEmployee } from '@/context/Employee/useSelectedEmployee';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const { selectedEmployee, setSelectedEmployee } = useSelectedEmployee();
  const [showChat, setShowChat] = useState(false); // for mobile toggle

  const handleSelectEmployee = (employee: { id: string; employeeName: string }) => {
    setSelectedEmployee(employee);
    setShowChat(true); // show chat on mobile
  };

  const handleBack = () => {
    setShowChat(false);
    setSelectedEmployee({ id: '', employeeName: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-8xl rounded-lg mt-14 bg-white shadow-md overflow-hidden">
        <div className="flex md:h-1/2 flex-col md:flex-row">
          {/* Left column (Employee List) */}
          <div className={`border-r md:w-[30%] ${showChat ? 'hidden md:block' : 'block'} w-full`}>
            <EmployeeList
              onSelect={handleSelectEmployee}
              selected={selectedEmployee || { id: '', employeeName: '' }}
            />
          </div>

          {/* Right column (Chat Window) */}
          <div className={`md:w-[70%] w-full ${showChat ? 'block' : 'hidden md:block'}`}>
            {/* Back button for mobile */}
            <div className="md:hidden p-3 border-b flex items-center bg-gray-100">
              <button
                onClick={handleBack}
                className="text-blue-600 gap-2 font-medium flex items-center"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <span className="ml-4 font-semibold text-gray-700">
                {selectedEmployee?.employeeName || 'Chat'}
              </span>
            </div>

            <ChatWindow employee={selectedEmployee} />
          </div>
        </div>
      </div>
    </div>
  );
}
