import { useEffect, useRef } from 'react';

interface ChatWindowProps {
  employee: { id: string; employeeName: string };
  hrSenderName?: string;
  messages: Message[];
}

export default function ChatMessages({ employee, messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]); // runs whenever new messages appear

  return (
    <div className="flex-1 overflow-auto p-4">
      {!employee.id || !messages ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          Select an employee from the left to open chat
        </div>
      ) : (
        <div className="space-y-4 h-[80vh] overflow-y-scroll">
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-400 mt-6">
              No messages yet. Start the conversation.
            </div>
          )}

          {messages.map((m) => {
            const isFromHR = m.senderId === 'HR';
            const ts =
              m.timestamp?.toDate?.() ??
              (m.timestamp?.seconds ? new Date(m.timestamp.seconds * 1000) : null);

            return (
              <div key={m.id} className={`flex ${isFromHR ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    isFromHR ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[11px] mt-1 ${isFromHR ? 'text-indigo-200' : 'text-gray-500'}`}
                  >
                    {ts ? ts.toLocaleString() : 'Sending...'}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Scroll target */}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
