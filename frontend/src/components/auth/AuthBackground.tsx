export function AuthBackground() {
  return (
    <>
      <div className="login-grid pointer-events-none absolute inset-0" />
      
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[12%] left-[8%] h-32 w-56 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute top-[18%] right-[10%] h-24 w-40 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute bottom-[20%] left-[12%] h-28 w-48 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute right-[15%] bottom-[28%] h-20 w-36 rounded-2xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute top-[35%] left-[20%] h-16 w-28 rounded-xl bg-[var(--blur-shape)] blur-sm" />
        <div className="absolute top-[42%] right-[22%] h-14 w-24 rounded-xl bg-[var(--blur-shape)] blur-sm" />
      </div>
    </>
  );
}
