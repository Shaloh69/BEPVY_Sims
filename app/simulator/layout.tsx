import Sidebar from "@/components/sidebar_sim";

export default function SimLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center">{children}</div>
      </main>
    </div>
  );
}
