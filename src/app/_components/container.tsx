export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-down mx-4 flex justify-center">
      <section className="w-full max-w-6xl">{children}</section>
    </div>
  );
}
