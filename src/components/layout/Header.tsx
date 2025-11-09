export default function Header() {
  return (
    <header className="w-full z-30 fixed h-14 flex items-center justify-between border-b bg-white px-6 shadow-sm">
      {/* Left: Logo */}
      <div className="hidden items-center md:flex ms-60 gap-2">
        <img src="/images/logo.png" alt="Logo" className="h-8 w-8" />
      </div>

      {/* Center: Title */}
      <h2 className="text-lg font-semibold text-center flex-1 text-gray-800">
        HR Feedback Admin Panel
      </h2>
    </header>
  );
}
