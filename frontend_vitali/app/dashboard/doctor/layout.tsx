import RoleTopBar from "@/components/RoleTopBar";

export default function DoctorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <RoleTopBar role="DOCTOR" />
      {children}
    </div>
  );
}
