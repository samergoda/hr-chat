import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MessageInput({
  employee,
  onSend,
}: {
  employee?: { id: string; employeeName: string };
  onSend: (text: string) => Promise<void> | void;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const disabled = !employee || sending;
  const canSend = !!text.trim();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!employee || !value) return;

    try {
      setSending(true);
      await onSend(value);
      setText(''); // clear after successful send
    } finally {
      setSending(false);
    }
  };

  // Submit on Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Send message
      handleSubmit(e as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t bg-white">
      <div className="flex gap-3">
        {/* Input send message */}
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
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
  );
}
