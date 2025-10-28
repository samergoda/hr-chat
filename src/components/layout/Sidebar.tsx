import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <div className="w-[200px] z-10 bg-gray-100 h-screen p-4 border-r">
      <h2 className="text-3xl font-bold mb-6">HR panel</h2>
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn("text-gray-700 hover:text-black", location.pathname === link.path && "font-semibold text-blue-600")}>
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
