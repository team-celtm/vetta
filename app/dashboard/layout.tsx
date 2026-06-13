import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import ClientDashboardLayout from "./ClientDashboardLayout";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("vetta_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    await jwtVerify(token, secret);
  } catch {
    redirect("/login");
  }

  return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
}
