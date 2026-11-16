import RoleTopBar from "@/components/RoleTopBar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <RoleTopBar role="ADMIN" />
      {children}
    </div>
  );
}
