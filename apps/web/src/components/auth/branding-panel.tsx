import * as React from "react";

interface StatItemProps {
  value: string;
  label: string;
  badgeText: string;
  badgeVariant: "info" | "success" | "warning";
}

const StatCard: React.FC<StatItemProps> = ({
  value,
  label,
  badgeText,
  badgeVariant,
}) => {
  return (
    <div className="bg-[#152347]/40 border border-slate-700/35 rounded-xl p-5 backdrop-blur-md transition-all duration-300 hover:border-slate-700/60 hover:bg-[#152347]/55">
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-sm text-slate-400 mt-1 font-medium">{label}</div>
      <div className="mt-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            badgeVariant === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : badgeVariant === "warning"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {badgeVariant === "success" && "● "}
          {badgeText}
        </span>
      </div>
    </div>
  );
};

export const BrandingPanel: React.FC = () => {
  return (
    <div className="relative flex-col justify-between hidden h-full p-10 text-white lg:flex lg:w-[48%] bg-gradient-to-br from-[#0c152c] to-[#050a16] border-r border-slate-800/60 overflow-y-auto">
      {/* Top logo & version */}
      <div className="flex items-center space-x-3 select-none">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <div>
          <div className="font-bold text-lg tracking-wider text-white">NAPROCS</div>
          <div className="text-[10px] text-slate-500 font-mono tracking-widest leading-none">
            EMS V2.0
          </div>
        </div>
      </div>

      {/* Hero statement */}
      <div className="my-auto max-w-[480px]">
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight">
          Your people. <br />
          <span className="text-blue-500">Your enterprise.</span> <br />
          One platform.
        </h1>
        <p className="mt-6 text-base text-slate-400 font-normal leading-relaxed">
          Naprocs EMS unifies workforce operations — attendance, compliance, approvals,
          and people analytics — into a single command layer for enterprise HR teams.
        </p>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-10">
          <StatCard
            value="4,287"
            label="Active Employees"
            badgeText="12 offices"
            badgeVariant="info"
          />
          <StatCard
            value="98.4%"
            label="Attendance Rate"
            badgeText="▲ 1.2% this month"
            badgeVariant="success"
          />
          <StatCard
            value="34"
            label="Open Requests"
            badgeText="Pending review"
            badgeVariant="warning"
          />
          <StatCard
            value="9"
            label="Departments"
            badgeText="All active"
            badgeVariant="success"
          />
        </div>
      </div>

      {/* Footer tags */}
      <div className="flex items-center space-x-6 text-xs text-slate-500 font-semibold tracking-widest uppercase select-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Attendance</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Approvals</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Analytics</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Compliance</span>
        </div>
      </div>
    </div>
  );
};
