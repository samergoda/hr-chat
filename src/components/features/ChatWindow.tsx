import { useEffect, useState, type FormEvent } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import ChatMessages from "./ChatMessages";

// 🔹 Define Firestore message type
interface Message {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp?: {
    toMillis?: () => number;
    seconds?: number;
    toDate?: () => Date;
  };
}

// 🔹 Props
interface ChatWindowProps {
  employeeName: string;
  hrSenderName?: string;
}

export default function ChatWindow({ employeeName, hrSenderName = "HR" }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  // const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // //  Auto-scroll to bottom
  // useEffect(() => {
  //   // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  //  Realtime Firestore listeners
  useEffect(() => {
    //  Clear messages when switching employees
    setMessages([]);

    if (!employeeName) return;

    const messagesRef = collection(db, "messages");

    // HR → Employee
    const q1 = query(messagesRef, where("sender", "==", hrSenderName), where("receiver", "==", employeeName), orderBy("timestamp", "asc"));

    // Employee → HR
    const q2 = query(messagesRef, where("sender", "==", employeeName), where("receiver", "==", hrSenderName), orderBy("timestamp", "asc"));

    // 🔥 Listen to both directions
    const unsub1 = onSnapshot(q1, (snap) => {
      const newMsgs = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];

      setMessages((prev) => mergeAndSortMessages(prev, newMsgs));
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const newMsgs = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];
      setMessages((prev) => mergeAndSortMessages(prev, newMsgs));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [employeeName, hrSenderName]);

  //  Merge and sort messages
  function mergeAndSortMessages(prevArray: Message[], newArray: Message[]): Message[] {
    const map = new Map<string, Message>();
    [...prevArray, ...newArray].forEach((msg) => map.set(msg.id, msg));

    return Array.from(map.values()).sort((a, b) => {
      const ta = a.timestamp?.toMillis?.() ?? (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0);
      const tb = b.timestamp?.toMillis?.() ?? (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0);
      return ta - tb;
    });
  }

  // Send message
  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || !employeeName) return;

    try {
      await addDoc(collection(db, "messages"), {
        sender: hrSenderName,
        receiver: employeeName,
        text: input.trim(),
        timestamp: serverTimestamp(),
      });
      setInput("");
    } catch (err) {
      toast.error("Failed to send message");
      console.error("Send message failed:", err);
    }
  }

  // 🧱 UI
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div>
          <h3 className="text-lg font-semibold">{employeeName ?? "Select an employee"}</h3>
          <div className="text-xs text-gray-500">HR Chat</div>
        </div>
        <div className="text-sm text-gray-600">{employeeName ? `Chatting with ${employeeName}` : "No chat selected"}</div>
      </header>

      {/* Messages */}
      <ChatMessages employeeName={employeeName} hrSenderName={hrSenderName} messages={messages} />

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!employeeName}
            placeholder={employeeName ? `Send message` : "Select employee to start"}
            className="flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!employeeName}
            className={`rounded-md px-4 py-2 font-medium transition ${
              employeeName ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
