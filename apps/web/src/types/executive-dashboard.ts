export type KpiMetric = {
  id: string;
  title: string;
  value: string | number;
  subtext: string;
  iconType: 'users' | 'calendar' | 'umbrella' | 'userPlus' | 'userMinus' | 'briefcase';
};

export type DepartmentHeadcount = {
  department: string;
  count: number;
  color: string;
};

export type Highlight = {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
};

export type QuickLinkType = {
  id: string;
  title: string;
  href: string;
  iconType: 'userPlus' | 'orgChart' | 'audit' | 'export' | 'users';
};
