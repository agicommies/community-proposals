export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-4 flex justify-center">
      <section className="max-w-6xl">{children}</section>
    </div>
  );
}
