import { useEffect, useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import ChatMessages from './ChatMessages';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelectedEmployee } from '@/context/useSelectedEmployee';

interface ChatWindowProps {
  employee?: { id: string; employeeName: string };
  conversationId?: string; // <- strongly recommended (employee)
  hrSenderId?: string; // machine ID, e.g. "hr_sconnor"
  hrDisplayName?: string; // for UI only
  hrSenderName: string;
}

export default function ChatWindow({
  employee: propEmployee,
  conversationId,
  hrSenderId = 'HR',
  hrDisplayName = 'HR',
}: ChatWindowProps) {
  const { selectedEmployee } = useSelectedEmployee();
  const employee = propEmployee || selectedEmployee;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const previousMessagesCount = useRef<number>(0);
  const disabled = !employee || sending;
  const canSend = !!input.trim();
  // Derive the conversationId if not provided (temporary fallback).
  // Prefer passing a real employee from the caller.
  function getConversationId() {
    if (conversationId) return conversationId;
    if (!employee) return '';
    // TEMP fallback: make a deterministic id from employee name.
    // Replace this with the real employee ASAP.
    return `emp_${employee.id.trim().toLowerCase().replace(/\s+/g, '_')}`;
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Send message
      sendMessage(e as FormEvent);
    }
  };

  // Ensure the conversation doc exists (idempotent)
  async function ensureConversationDoc(convId: string) {
    const convRef = doc(db, 'conversations', convId);
    await setDoc(
      convRef,
      {
        participantNames: [hrDisplayName, employee?.employeeName ?? ''],
        lastMessage: '', // optional: only set if not present
        lastMessageTimestamp: serverTimestamp(),
      },
      { merge: true },
    );
  }

  // Realtime listener on the nested messages subcollection
  useEffect(() => {
    setMessages([]);
    if (!employee) return;

    const convId = getConversationId();
    const msgsRef = collection(db, 'conversations', convId, 'messages');
    const q = query(msgsRef, orderBy('timestamp', 'asc'));

    // Make sure the conversation doc exists so Admin list can show it
    ensureConversationDoc(convId).catch(console.error);

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp,
        } as Message;
      });

      // Only show toast if there are new messages and it's not the initial load
      if (previousMessagesCount.current > 0 && rows.length > previousMessagesCount.current) {
        // Show notification only for messages we didn't send
        const lastMessage = rows[rows.length - 1];
        if (lastMessage && lastMessage.senderId !== hrSenderId) {
          toast.success(`New message from ${employee?.employeeName || 'employee'}`);
        }
      }

      previousMessagesCount.current = rows.length;
      setMessages(rows);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, conversationId, hrSenderId, hrDisplayName]);

  //  Send message
  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    setSending(true);

    const text = input.trim();
    if (!text || !employee) return;

    const convId = getConversationId();
    try {
      const batch = writeBatch(db);

      const convRef = doc(db, 'conversations', convId);
      const msgRef = doc(collection(convRef, 'messages')); // auto-ID
      const now = serverTimestamp();

      // 1) message doc
      batch.set(msgRef, {
        senderId: hrSenderId, // machine id
        text,
        timestamp: now,
      });

      // 2) conversation preview/sort fields
      batch.set(
        convRef,
        {
          participantNames: [hrDisplayName, employee],
          lastMessage: text,
          lastMessageTimestamp: now,
        },
        { merge: true },
      );

      await batch.commit();
      setInput('');
    } catch (err) {
      console.error('Send message failed:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div>
          <h3 className="text-lg font-semibold">
            {employee?.employeeName ?? 'Select an employee'}
          </h3>
          <div className="text-xs text-gray-500">HR Chat</div>
        </div>
        <div className="text-sm text-gray-600">
          {employee?.employeeName ? `Chatting with ${employee.employeeName}` : 'No chat selected'}
        </div>
      </header>

      {/* Messages */}
      <ChatMessages
        employee={employee || { id: '', employeeName: '' }}
        hrSenderName={hrDisplayName}
        messages={messages.map((m) => ({
          id: m.id,
          sender: m.senderId, // keep compatibility with your ChatMessages
          text: m.text,
          timestamp: m.timestamp,
        }))}
      />

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t bg-white">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              employee ? `Send message to ${employee.employeeName}` : 'Select employee to start'
            }
            className="flex-1"
          />
          <Button type="submit" disabled={disabled || !canSend}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}
