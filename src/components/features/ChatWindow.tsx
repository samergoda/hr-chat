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
import { useSelectedEmployee } from '@/context/Employee/useSelectedEmployee';

interface ChatWindowProps {
  employee: { id: string; employeeName: string };
}

export default function ChatWindow({ employee: propEmployee }: ChatWindowProps) {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const previousMessagesCount = useRef<number>(0);

  // Context
  const { selectedEmployee } = useSelectedEmployee();
  const employee = propEmployee || selectedEmployee;

  // Variables
  const disabled = !employee || sending;
  const canSend = !!input.trim();

  // Derive the conversationId if not provided (temporary fallback).
  function getConversationId() {
    if (!employee) return '';

    // TEMP fallback: make a deterministic id from employee name.
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
        participantNames: ['HR', employee?.employeeName ?? ''],
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
        if (lastMessage && lastMessage.senderId !== 'HR') {
          toast.success(`New message from ${employee?.employeeName || 'employee'}`);
        }
      }

      previousMessagesCount.current = rows.length;
      setMessages(rows);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

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
        senderId: 'HR',
        text,
        timestamp: now,
      });

      // 2) conversation preview/sort fields
      batch.set(
        convRef,
        {
          participantNames: ['HR', employee],
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
    <div className="flex flex-col  bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold">
            {employee?.employeeName ?? 'Select an employee'}
          </h3>
          <div className="text-xs text-gray-500">HR Chat</div>
        </div>

        {/* Subtitle */}
        <div className="text-sm text-gray-600">
          {employee?.employeeName ? `Chatting with ${employee.employeeName}` : 'No chat selected'}
        </div>
      </header>

      {/* Messages */}
      <ChatMessages employee={employee || { id: '', employeeName: '' }} messages={messages} />

      {/* Form send message */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t bg-white">
        <div className="flex gap-3">
          {/* Input message */}
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

          {/* Button send message */}
          <Button type="submit" disabled={disabled || !canSend}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}
