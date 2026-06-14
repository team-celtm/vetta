import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Link from "next/link";
import { Building2, UserPlus, Users, LayoutDashboard } from "lucide-react";
import LogoutButton from "./LogoutButton";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("vetta_admin_token")?.value;
  
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden text-white font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb15,transparent_30%),radial-gradient(circle_at_bottom_right,#7c3aed15,transparent_30%)] pointer-events-none" />

      {/* Sidebar */}
      <aside className="relative z-20 w-64 border-r border-white/10 bg-white/5 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-blue-400 font-bold tracking-widest uppercase text-sm">
            <LayoutDashboard size={20} />
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link
            href="/admin/create-org"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          >
            <Building2 size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">Create Organization</span>
          </Link>
          
          <Link
            href="/admin/create-user"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          >
            <UserPlus size={18} className="text-blue-400" />
            <span className="text-sm font-medium">Create User</span>
          </Link>

          <Link
            href="/admin/create-candidate"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          >
            <Users size={18} className="text-purple-400" />
            <span className="text-sm font-medium">Create Candidate</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
