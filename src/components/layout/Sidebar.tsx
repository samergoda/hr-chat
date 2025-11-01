import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CircleX, Menu } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Chat', path: '/chat' },
  ];

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-4 top-2.5 z-40 rounded-md border bg-white px-3 py-2 text-sm font-medium shadow-sm"
        aria-label="Open menu"
        aria-controls="sidebar"
        aria-expanded={open}
      >
        <Menu />
      </button>

      {/* Backdrop on mobile */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r bg-gray-100 p-4 transition-transform',

          open ? 'translate-x-0' : '-translate-x-full',

          'md:translate-x-0 md:static md:block',
        )}
        role="navigation"
        aria-label="Main"
      >
        {/* Close (mobile) */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <h2 className="text-2xl font-bold">HR panel</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border bg-white px-2 py-1 text-sm shadow-sm"
            aria-label="Close menu"
          >
            <CircleX />
          </button>
        </div>

        {/* Header (desktop) */}
        <h2 className="hidden text-3xl font-bold md:block mb-6">HR panel</h2>

        <nav className="flex flex-col gap-3">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'rounded px-2 py-1 text-gray-700 hover:bg-gray-200 hover:text-black',
                  active && 'font-semibold text-blue-600 bg-blue-50',
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
