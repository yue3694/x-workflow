import Sidebar from "@/components/sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-svh flex-col bg-background text-foreground md:flex-row">
      <Sidebar />
      <main className="flex-grow overflow-y-auto p-4 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
