interface Employee {
  id: string;
  employeeName: string;
  date: Timestamp;
  score: number;
  notes: string;
  participantNames: string[];
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp?: {
    toMillis?: () => number;
    seconds?: number;
    toDate?: () => Date;
  };
}

interface Feedback {
  id: string;
  date?: Timestamp | { seconds?: number; nanoseconds?: number };
  employeeName?: string;
  score?: number;
  notes?: string;
}

interface SelectedEmployeeContextType {
  selectedEmployee: {
    id: string;
    employeeName: string;
  } | null;
  setSelectedEmployee: (employee: { id: string; employeeName: string } | null) => void;
  clearSelectedEmployee: () => void;
}
