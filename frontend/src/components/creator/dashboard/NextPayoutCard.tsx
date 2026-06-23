export function NextPayoutCard({
  amount,
  date,
}: {
  amount: string;
  date: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#6366f1] p-6">
      <p
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Next Payout: {amount}
      </p>
      <p className="mt-2 text-sm text-white/70">{date}</p>
    </div>
  );
}
