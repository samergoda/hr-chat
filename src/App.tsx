import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Chat from '@/pages/Chat';
import Sidebar from './components/layout/Sidebar';
import './App.css';
import Header from './components/layout/Header';
import { SelectedEmployeeProvider } from './context/SelectedEmployeeContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <SelectedEmployeeProvider>
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
    </SelectedEmployeeProvider>
  );
}

export default App;
