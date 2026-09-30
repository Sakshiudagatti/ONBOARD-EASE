// [title, owner, due offset in days from start date]
export const OWNERS = ['HR', 'IT', 'Manager', 'Buddy', 'Employee'];

export const COMMON = [
  ['Sign contract and policies', 'HR', 0],
  ['Collect ID and bank details', 'HR', 0],
  ['Set up laptop and accounts', 'IT', 0],
  ['Welcome meeting with manager', 'Manager', 1],
  ['Meet onboarding buddy', 'Buddy', 1],
  ['Complete security training', 'Employee', 7],
  ['Set 30-60-90 day goals', 'Manager', 14],
  ['30-day check-in', 'Manager', 30],
];

export const DEPT = {
  Engineering: [['Repo and CI access', 'IT', 1], ['Set up dev environment', 'Employee', 2], ['Code walkthrough', 'Buddy', 5], ['Ship first pull request', 'Employee', 10]],
  Sales: [['CRM access and pipeline tour', 'IT', 1], ['Shadow 3 customer calls', 'Buddy', 5], ['Learn pricing and demo script', 'Employee', 7], ['Run first demo', 'Employee', 20]],
  Marketing: [['Review brand guidelines', 'Manager', 2], ['Analytics and ad tool access', 'IT', 2], ['Review campaign calendar', 'Employee', 5], ['Draft first campaign brief', 'Employee', 14]],
  HR: [['HRIS admin access', 'IT', 1], ['Review hiring pipeline', 'Manager', 3], ['Learn local employment law basics', 'Employee', 10]],
  Finance: [['ERP and banking portal access', 'IT', 2], ['Review close calendar', 'Manager', 3], ['Shadow month-end close', 'Buddy', 10]],
  Design: [['Design tool and library access', 'IT', 1], ['Review design system', 'Buddy', 3], ['Critique session intro', 'Manager', 7], ['Deliver first design', 'Employee', 14]],
};
