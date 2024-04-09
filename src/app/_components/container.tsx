export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center mx-4">
      <section className="w-full max-w-6xl">{children}</section>
    </div>
  );
}
