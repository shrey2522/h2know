import { notFound } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { isValidUserId } from "@/lib/userId";

interface PageProps {
  params: { userId: string };
}

export default function UserDashboardPage({ params }: PageProps) {
  if (!isValidUserId(params.userId)) {
    notFound();
  }

  return <Dashboard userId={params.userId} />;
}
