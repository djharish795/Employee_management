import { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  FileText, 
  Settings, 
  Bell, 
  Briefcase,
  PieChart
} from "lucide-react";

export const metadata: Metadata = {
  title: "CEO Dashboard | Naprocs EMS",
  description: "Executive overview and controls",
};

export default function CeoDashboardPage() {
  const stats = [
    { label: "Total Employees", value: "-", trend: "" },
    { label: "Active Roles", value: "-", trend: "" },
    { label: "Compliance Score", value: "-", trend: "" },
    { label: "Open Tasks", value: "-", trend: "" },
  ];

  const modules = [
    { title: "Organisation Chart", desc: "View hierarchy and structure", icon: Building2, href: "/ceo/organisation", color: "bg-blue-100 text-blue-600" },
    { title: "Succession Planning", desc: "Manage key role transitions", icon: Users, href: "/ceo/succession-planning", color: "bg-purple-100 text-purple-600" },
    { title: "Compliance Hub", desc: "Statutory filings and policies", icon: ShieldCheck, href: "/compliance/dashboard", color: "bg-emerald-100 text-emerald-600" },
    { title: "Reports & Analytics", desc: "Executive summaries and data", icon: PieChart, href: "/ceo/reports", color: "bg-amber-100 text-amber-600" },
    { title: "Task Management", desc: "Assign and track priorities", icon: Briefcase, href: "/tasks", color: "bg-indigo-100 text-indigo-600" },
    { title: "Notifications", desc: "System alerts and deduplicated events", icon: Bell, href: "/notifications", color: "bg-rose-100 text-rose-600" },
    { title: "Documents", desc: "Secure vault and uploads", icon: FileText, href: "/documents", color: "bg-cyan-100 text-cyan-600" },
    { title: "Settings", desc: "Org policies and workflow rules", icon: Settings, href: "/settings", color: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here's what's happening across the organization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : stat.trend === '0%' ? 'text-gray-400' : 'text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.title} href={m.href} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex flex-col items-start gap-4">
                <div className={`p-3 rounded-xl ${m.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{m.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
