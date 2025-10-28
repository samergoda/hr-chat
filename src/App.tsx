import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Sidebar from "./components/layout/Sidebar";
import "./App.css";
import Header from "./components/layout/Header";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Toaster } from "sonner";

function App() {
  function TestConnection() {
    useEffect(() => {
      async function check() {
        // const snap = await getDocs(collection(db, "conversations"));
        onSnapshot(collection(db, "conversations"), (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("🔥 Firestore data:", data);
          // setFeedback(data);
        });
        // console.log("✅ Connected to Firestore:", snap, "docs found");
      }
      check();
    }, []);

    return null;
  }

  TestConnection();
  return (
    <BrowserRouter>
      <div className="flex">
        {/*  Sidebar  */}
        <Sidebar />

        {/* Top Header */}
        <Header />

        {/* Routes  */}
        <div className="flex-1 mt-11">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </div>

      {/* Toaster */}
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
