import SessionGuard from "@/components/SessionGuard";

/** Todas las páginas de los paneles comparten el cierre de sesión por inactividad. */
export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SessionGuard />
      {children}
    </>
  );
}
