export default function DashboardLoading() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: "#fbf9f5" }}
    >
      <img
        src="/loading_apple.gif"
        alt="Loading..."
        width={120}
        height={120}
        style={{ imageRendering: "auto" }}
      />
      <p
        className="mt-4 text-sm font-medium tracking-wide"
        style={{ color: "#2b6954", fontFamily: "var(--font-manrope), sans-serif" }}
      >
        Loading your pantry…
      </p>
    </div>
  );
}
