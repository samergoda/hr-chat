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
