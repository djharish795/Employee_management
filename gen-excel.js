// Naprocs EMS — Comprehensive Data Entry Excel Generator
// Run: node gen-excel.js
const ExcelJS = require("exceljs");
const workbook = new ExcelJS.Workbook();
workbook.creator = "Naprocs Technologies";

const H = "1E293B", W = "FFFFFF", A = "F1F5F9", BD = "CBD5E1";

function hs(m) {
  return {
    font: { bold: true, color: { argb: W }, size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: m ? "DC2626" : H } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: { top: { style: "thin", color: { argb: BD } }, bottom: { style: "thin", color: { argb: BD } }, left: { style: "thin", color: { argb: BD } }, right: { style: "thin", color: { argb: BD } } }
  };
}

function ds(a) {
  return {
    font: { size: 10 },
    fill: a ? { type: "pattern", pattern: "solid", fgColor: { argb: A } } : undefined,
    alignment: { vertical: "middle", wrapText: true },
    border: { top: { style: "hair", color: { argb: BD } }, bottom: { style: "hair", color: { argb: BD } }, left: { style: "hair", color: { argb: BD } }, right: { style: "hair", color: { argb: BD } } }
  };
}

function addWs(n, t) {
  return workbook.addWorksheet(n, { properties: { tabColor: { argb: t } }, views: [{ state: "frozen", ySplit: 3 }] });
}

function headers(ws, title, cols) {
  ws.mergeCells(1, 1, 1, cols.length);
  var tc = ws.getCell(1, 1);
  tc.value = "Naprocs EMS — " + title;
  tc.style = { font: { bold: true, size: 13, color: { argb: W } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "334155" } }, alignment: { horizontal: "center", vertical: "middle" } };
  ws.getRow(1).height = 28;
  ws.mergeCells(2, 1, 2, cols.length);
  var lc = ws.getCell(2, 1);
  lc.value = "RED headers = MANDATORY  |  Fill from Row 4 downward  |  See sheet 19 for all allowed enum values";
  lc.style = { font: { italic: true, size: 9 }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FEF9C3" } }, alignment: { horizontal: "left", vertical: "middle" } };
  ws.getRow(2).height = 18;
  cols.forEach(function (c, i) {
    var cell = ws.getCell(3, i + 1);
    cell.value = c.h;
    cell.style = hs(c.m);
    ws.getColumn(i + 1).width = c.w || 20;
  });
  ws.getRow(3).height = 34;
}

function addRows(ws, cols, data) {
  data.forEach(function (r, ri) {
    ws.getRow(ri + 4).height = 18;
    cols.forEach(function (c, ci) {
      var cell = ws.getCell(ri + 4, ci + 1);
      cell.value = r[c.k] !== undefined ? r[c.k] : "";
      cell.style = ds(ri % 2 === 1);
    });
  });
}

// ============================================================
// SHEET 1: DEPARTMENTS
// ============================================================
var w1 = addWs("01 Departments", "EF4444");
var c1 = [
  { k: "code", h: "Dept Code *", m: 1, w: 16 },
  { k: "name", h: "Dept Name *", m: 1, w: 32 },
  { k: "parent", h: "Parent Dept (blank = top-level)", m: 0, w: 35 },
  { k: "head", h: "Head Emp ID (fill after employees added)", m: 0, w: 36 }
];
headers(w1, "Departments Setup", c1);
addRows(w1, c1, [
  { code: "ADMIN", name: "Administration", parent: "", head: "NAP-001" },
  { code: "HR", name: "Human Resources", parent: "", head: "NAP-003" },
  { code: "TECH", name: "Technology", parent: "", head: "NAP-002" },
  { code: "DEV", name: "Software Development", parent: "Technology", head: "NAP-005" },
  { code: "QA", name: "Quality Assurance", parent: "Technology", head: "" },
  { code: "SALES", name: "Sales & Business Development", parent: "", head: "" },
  { code: "OPS", name: "Operations", parent: "", head: "" },
  { code: "FIN", name: "Finance & Accounts", parent: "", head: "" },
  { code: "MKT", name: "Marketing", parent: "Sales & Business Development", head: "" },
  { code: "CEM", name: "Client Engagement Management", parent: "Operations", head: "" }
]);

// ============================================================
// SHEET 2: DESIGNATIONS
// ============================================================
var w2 = addWs("02 Designations", "DC2626");
var c2 = [
  { k: "title", h: "Designation Title *", m: 1, w: 32 },
  { k: "dept", h: "Department Name *", m: 1, w: 30 },
  { k: "band", h: "Band\n(L1/L2/L3/M1/M2/E1/E2)", m: 0, w: 22 },
  { k: "grade", h: "Grade\n(Junior/Senior/Lead/Manager/Executive)", m: 0, w: 30 },
  { k: "reportsTo", h: "Reports To Designation", m: 0, w: 30 }
];
headers(w2, "Designations Setup", c2);
addRows(w2, c2, [
  { title: "CEO", dept: "Administration", band: "E1", grade: "Executive", reportsTo: "" },
  { title: "CTO", dept: "Technology", band: "E1", grade: "Executive", reportsTo: "" },
  { title: "CHRO", dept: "Human Resources", band: "E1", grade: "Executive", reportsTo: "" },
  { title: "CFO", dept: "Finance & Accounts", band: "E1", grade: "Executive", reportsTo: "" },
  { title: "Operations Head", dept: "Operations", band: "E2", grade: "Senior Executive", reportsTo: "CEO" },
  { title: "HR Manager", dept: "Human Resources", band: "M1", grade: "Manager", reportsTo: "CHRO" },
  { title: "HR Executive", dept: "Human Resources", band: "L2", grade: "Senior", reportsTo: "HR Manager" },
  { title: "HR Assistant", dept: "Human Resources", band: "L1", grade: "Junior", reportsTo: "HR Executive" },
  { title: "Tech Lead", dept: "Software Development", band: "L3", grade: "Lead", reportsTo: "CTO" },
  { title: "Senior Software Engineer", dept: "Software Development", band: "L2", grade: "Senior", reportsTo: "Tech Lead" },
  { title: "Software Engineer", dept: "Software Development", band: "L1", grade: "Junior", reportsTo: "Tech Lead" },
  { title: "QA Lead", dept: "Quality Assurance", band: "L3", grade: "Lead", reportsTo: "CTO" },
  { title: "QA Engineer", dept: "Quality Assurance", band: "L1", grade: "Junior", reportsTo: "QA Lead" },
  { title: "Project Manager", dept: "Software Development", band: "M1", grade: "Manager", reportsTo: "CTO" },
  { title: "Sales Manager", dept: "Sales & Business Development", band: "M1", grade: "Manager", reportsTo: "CEO" },
  { title: "Sales Executive", dept: "Sales & Business Development", band: "L1", grade: "Junior", reportsTo: "Sales Manager" },
  { title: "Finance Analyst", dept: "Finance & Accounts", band: "L1", grade: "Junior", reportsTo: "CFO" },
  { title: "Accounts Manager", dept: "Finance & Accounts", band: "M1", grade: "Manager", reportsTo: "CFO" },
  { title: "CEM Executive", dept: "Client Engagement Management", band: "L1", grade: "Junior", reportsTo: "Operations Head" },
  { title: "CRM Executive", dept: "Sales & Business Development", band: "L1", grade: "Junior", reportsTo: "Sales Manager" },
  { title: "IT Admin", dept: "Administration", band: "L2", grade: "Senior", reportsTo: "CTO" },
  { title: "Office Executive", dept: "Administration", band: "L1", grade: "Junior", reportsTo: "Operations Head" }
]);

// ============================================================
// SHEET 3: EMPLOYEES MASTER (55 COLUMNS)
// ============================================================
var w3 = addWs("03 Employees Master", "3B82F6");
var c3 = [
  { k: "empId",          h: "Employee ID *\n(e.g. NAP-001)",                                          m: 1, w: 18 },
  { k: "firstName",      h: "First Name *",                                                           m: 1, w: 18 },
  { k: "middleName",     h: "Middle Name",                                                            m: 0, w: 16 },
  { k: "lastName",       h: "Last Name *",                                                            m: 1, w: 18 },
  { k: "preferredName",  h: "Preferred / Nick Name",                                                  m: 0, w: 20 },
  { k: "officialEmail",  h: "Official Email *",                                                       m: 1, w: 32 },
  { k: "personalEmail",  h: "Personal Email",                                                         m: 0, w: 30 },
  { k: "phone",          h: "Mobile Number *",                                                        m: 1, w: 18 },
  { k: "altPhone",       h: "Alternate Phone",                                                        m: 0, w: 18 },
  { k: "dob",            h: "Date of Birth\n(YYYY-MM-DD)",                                            m: 0, w: 22 },
  { k: "gender",         h: "Gender\n(MALE/FEMALE/OTHER/PREFER_NOT_TO_SAY)",                          m: 0, w: 32 },
  { k: "bloodGroup",     h: "Blood Group\n(A+/A-/B+/B-/AB+/AB-/O+/O-)",                              m: 0, w: 26 },
  { k: "marital",        h: "Marital Status\n(SINGLE/MARRIED/DIVORCED/WIDOWED)",                      m: 0, w: 30 },
  { k: "nationality",    h: "Nationality",                                                            m: 0, w: 18 },
  { k: "deptName",       h: "Department Name *\n(from Dept sheet)",                                   m: 1, w: 30 },
  { k: "desigTitle",     h: "Designation Title *\n(from Designation sheet)",                          m: 1, w: 30 },
  { k: "empType",        h: "Employee Type *\n(FULL_TIME/PART_TIME/CONTRACT/INTERN)",                 m: 1, w: 32 },
  { k: "joiningDate",    h: "Joining Date *\n(YYYY-MM-DD)",                                           m: 1, w: 22 },
  { k: "workLocation",   h: "Work Location\n(e.g. Hyderabad HQ)",                                    m: 0, w: 26 },
  { k: "status",         h: "Status *\n(PROBATION/ACTIVE/ONBOARDING)",                               m: 1, w: 28 },
  { k: "band",           h: "Band\n(L1/L2/L3/M1/M2/E1/E2)",                                         m: 0, w: 18 },
  { k: "grade",          h: "Grade\n(Junior/Senior/Lead/Manager/Executive)",                          m: 0, w: 26 },
  { k: "reportingMgr",   h: "Reporting Manager\nEmployee ID",                                        m: 0, w: 26 },
  { k: "skipLevel",      h: "Skip Level Manager\nEmployee ID",                                       m: 0, w: 26 },
  { k: "assignedHr",     h: "Assigned HR\nEmployee ID",                                              m: 0, w: 24 },
  { k: "role",           h: "System Role *\n(EMPLOYEE/MANAGER/TEAM_LEAD/HR/FINANCE/IT/CEO/CTO/CHRO/SUPER_ADMIN/CEM/CRM/OE/OM)", m: 1, w: 42 },
  { k: "password",       h: "Initial Password *\n(min 8 chars + uppercase + number + special char)",  m: 1, w: 32 },
  { k: "aadhaar",        h: "Aadhaar Number\n(12 digits — system AES-256 encrypts)",                 m: 0, w: 32 },
  { k: "pan",            h: "PAN Number\n(e.g. ABCDE1234F)",                                         m: 0, w: 22 },
  { k: "passport",       h: "Passport Number",                                                       m: 0, w: 20 },
  { k: "voterId",        h: "Voter ID Number",                                                       m: 0, w: 20 },
  { k: "drivingLic",     h: "Driving Licence No.",                                                   m: 0, w: 22 },
  { k: "bgVerified",     h: "Background Verified?\n(TRUE/FALSE)",                                    m: 0, w: 25 },
  { k: "cLine1",         h: "Current Address Line 1",                                                m: 0, w: 36 },
  { k: "cLine2",         h: "Current Address Line 2",                                                m: 0, w: 36 },
  { k: "cCity",          h: "Current City",                                                          m: 0, w: 20 },
  { k: "cState",         h: "Current State",                                                         m: 0, w: 22 },
  { k: "cPin",           h: "Current Pincode",                                                       m: 0, w: 18 },
  { k: "cCountry",       h: "Current Country",                                                       m: 0, w: 18 },
  { k: "pLine1",         h: "Permanent Address Line 1",                                              m: 0, w: 36 },
  { k: "pLine2",         h: "Permanent Address Line 2",                                              m: 0, w: 36 },
  { k: "pCity",          h: "Permanent City",                                                        m: 0, w: 20 },
  { k: "pState",         h: "Permanent State",                                                       m: 0, w: 22 },
  { k: "pPin",           h: "Permanent Pincode",                                                     m: 0, w: 18 },
  { k: "pCountry",       h: "Permanent Country",                                                     m: 0, w: 18 },
  { k: "ecName",         h: "Emergency Contact Name",                                                m: 0, w: 26 },
  { k: "ecRel",          h: "Emergency Contact Relation",                                            m: 0, w: 24 },
  { k: "ecPhone",        h: "Emergency Contact Phone",                                               m: 0, w: 24 },
  { k: "bankName",       h: "Bank Name\n(e.g. HDFC Bank)",                                          m: 0, w: 24 },
  { k: "bankBranch",     h: "Bank Branch",                                                           m: 0, w: 24 },
  { k: "bankAcc",        h: "Bank Account Number\n(plain text — system encrypts AES-256)",           m: 0, w: 30 },
  { k: "bankIfsc",       h: "IFSC Code\n(e.g. HDFC0001234)",                                        m: 0, w: 22 },
  { k: "accType",        h: "Account Type\n(SAVINGS/CURRENT)",                                      m: 0, w: 22 },
  { k: "payMode",        h: "Payment Mode\n(NEFT/IMPS/RTGS)",                                       m: 0, w: 22 },
  { k: "payFreq",        h: "Payment Frequency\n(MONTHLY)",                                         m: 0, w: 22 },
  { k: "photoUrl",       h: "Photo URL / S3 Key\n(upload separately via portal)",                   m: 0, w: 36 }
];
headers(w3, "Employee Master — All 55 Columns", c3);
addRows(w3, c3, [
  { empId:"NAP-001",firstName:"Pradeep",middleName:"",lastName:"Chandra",preferredName:"PC",officialEmail:"pradeep.chandra@naprocs.in",personalEmail:"pradeep.personal@gmail.com",phone:"9876543210",altPhone:"",dob:"1978-03-15",gender:"MALE",bloodGroup:"O+",marital:"MARRIED",nationality:"Indian",deptName:"Administration",desigTitle:"CEO",empType:"FULL_TIME",joiningDate:"2020-01-01",workLocation:"Hyderabad HQ",status:"ACTIVE",band:"E1",grade:"Executive",reportingMgr:"",skipLevel:"",assignedHr:"NAP-003",role:"CEO",password:"Naprocs@2024!",aadhaar:"123412341234",pan:"ABCPC1234D",passport:"N1234567",voterId:"TRX1234567",drivingLic:"TS09 2020 0012345",bgVerified:"TRUE",cLine1:"Flat 501 Skyline Towers",cLine2:"Jubilee Hills",cCity:"Hyderabad",cState:"Telangana",cPin:"500033",cCountry:"India",pLine1:"H.No 7-8-9 Gandhi Nagar",pLine2:"",pCity:"Nellore",pState:"Andhra Pradesh",pPin:"524001",pCountry:"India",ecName:"Sunitha Chandra",ecRel:"Spouse",ecPhone:"9876543200",bankName:"HDFC Bank",bankBranch:"Jubilee Hills Hyd",bankAcc:"50100123456789",bankIfsc:"HDFC0001234",accType:"SAVINGS",payMode:"NEFT",payFreq:"MONTHLY",photoUrl:"" },
  { empId:"NAP-002",firstName:"Lokesh",middleName:"",lastName:"Reddy",preferredName:"Lok",officialEmail:"lokesh.reddy@naprocs.in",personalEmail:"lokesh.r@gmail.com",phone:"9876543211",altPhone:"",dob:"1982-07-22",gender:"MALE",bloodGroup:"B+",marital:"MARRIED",nationality:"Indian",deptName:"Technology",desigTitle:"CTO",empType:"FULL_TIME",joiningDate:"2020-01-01",workLocation:"Hyderabad HQ",status:"ACTIVE",band:"E1",grade:"Executive",reportingMgr:"NAP-001",skipLevel:"",assignedHr:"NAP-003",role:"CTO",password:"Naprocs@2024!",aadhaar:"234523452345",pan:"BCDLR5678E",passport:"N2345678",voterId:"TRX2345678",drivingLic:"TS09 2019 0054321",bgVerified:"TRUE",cLine1:"Plot 22 Kavuri Hills",cLine2:"Phase II",cCity:"Hyderabad",cState:"Telangana",cPin:"500081",cCountry:"India",pLine1:"4-5-6 Lakshmipuram",pLine2:"",pCity:"Hyderabad",pState:"Telangana",pPin:"500004",pCountry:"India",ecName:"Padmavathi Reddy",ecRel:"Spouse",ecPhone:"9876500002",bankName:"State Bank of India",bankBranch:"Madhapur Hyd",bankAcc:"20012345678901",bankIfsc:"SBIN0012345",accType:"SAVINGS",payMode:"NEFT",payFreq:"MONTHLY",photoUrl:"" },
  { empId:"NAP-003",firstName:"Tejesh",middleName:"Kumar",lastName:"Vemula",preferredName:"Tej",officialEmail:"tejesh.vemula@naprocs.in",personalEmail:"tejesh.v@gmail.com",phone:"9876543212",altPhone:"7890123456",dob:"1990-11-05",gender:"MALE",bloodGroup:"A+",marital:"SINGLE",nationality:"Indian",deptName:"Human Resources",desigTitle:"HR Manager",empType:"FULL_TIME",joiningDate:"2021-06-01",workLocation:"Hyderabad HQ",status:"ACTIVE",band:"M1",grade:"Manager",reportingMgr:"NAP-001",skipLevel:"",assignedHr:"NAP-003",role:"HR",password:"Naprocs@2024!",aadhaar:"345634563456",pan:"CDETVK9012F",passport:"",voterId:"TRX3456789",drivingLic:"",bgVerified:"TRUE",cLine1:"Apt 301 Vasavi Residency",cLine2:"Kondapur",cCity:"Hyderabad",cState:"Telangana",cPin:"500084",cCountry:"India",pLine1:"12-3-456 Main Road Nampally",pLine2:"",pCity:"Hyderabad",pState:"Telangana",pPin:"500001",pCountry:"India",ecName:"Suresh Vemula",ecRel:"Father",ecPhone:"9876500100",bankName:"ICICI Bank",bankBranch:"Kondapur Hyd",bankAcc:"012345678901",bankIfsc:"ICIC0001234",accType:"SAVINGS",payMode:"NEFT",payFreq:"MONTHLY",photoUrl:"" },
  { empId:"NAP-004",firstName:"Anusha",middleName:"",lastName:"Pillai",preferredName:"Anu",officialEmail:"anusha.pillai@naprocs.in",personalEmail:"anusha.p@gmail.com",phone:"9876543213",altPhone:"",dob:"1994-04-18",gender:"FEMALE",bloodGroup:"AB+",marital:"MARRIED",nationality:"Indian",deptName:"Software Development",desigTitle:"Senior Software Engineer",empType:"FULL_TIME",joiningDate:"2022-03-15",workLocation:"Hyderabad HQ",status:"ACTIVE",band:"L2",grade:"Senior",reportingMgr:"NAP-005",skipLevel:"NAP-002",assignedHr:"NAP-003",role:"EMPLOYEE",password:"Naprocs@2024!",aadhaar:"456745674567",pan:"DEFAP3456G",passport:"N4567890",voterId:"",drivingLic:"TS09 2021 0099876",bgVerified:"TRUE",cLine1:"H.No. 8-2-293 Road No.82",cLine2:"Jubilee Hills",cCity:"Hyderabad",cState:"Telangana",cPin:"500034",cCountry:"India",pLine1:"TC 7/1420 Kowdiar",pLine2:"",pCity:"Thiruvananthapuram",pState:"Kerala",pPin:"695003",pCountry:"India",ecName:"Rajeev Pillai",ecRel:"Husband",ecPhone:"9876500200",bankName:"Axis Bank",bankBranch:"Banjara Hills Hyd",bankAcc:"91502019876543",bankIfsc:"UTIB0001234",accType:"SAVINGS",payMode:"NEFT",payFreq:"MONTHLY",photoUrl:"" },
  { empId:"NAP-005",firstName:"Karthik",middleName:"",lastName:"Menon",preferredName:"Karthi",officialEmail:"karthik.menon@naprocs.in",personalEmail:"karthik.m@gmail.com",phone:"9876543214",altPhone:"",dob:"1987-09-25",gender:"MALE",bloodGroup:"B-",marital:"MARRIED",nationality:"Indian",deptName:"Software Development",desigTitle:"Tech Lead",empType:"FULL_TIME",joiningDate:"2020-04-01",workLocation:"Hyderabad HQ",status:"ACTIVE",band:"L3",grade:"Lead",reportingMgr:"NAP-002",skipLevel:"NAP-001",assignedHr:"NAP-003",role:"TEAM_LEAD",password:"Naprocs@2024!",aadhaar:"567856785678",pan:"EFGKM6789H",passport:"",voterId:"TRX5678901",drivingLic:"",bgVerified:"TRUE",cLine1:"6-3-248/A Road No.1",cLine2:"Banjara Hills",cCity:"Hyderabad",cState:"Telangana",cPin:"500034",cCountry:"India",pLine1:"234 Rajagiri Valley",pLine2:"",pCity:"Ernakulam",pState:"Kerala",pPin:"683501",pCountry:"India",ecName:"Deepa Menon",ecRel:"Spouse",ecPhone:"9876500300",bankName:"HDFC Bank",bankBranch:"Banjara Hills Hyd",bankAcc:"50100234567890",bankIfsc:"HDFC0001235",accType:"SAVINGS",payMode:"NEFT",payFreq:"MONTHLY",photoUrl:"" }
]);

// ============================================================
// SHEET 4: SALARY STRUCTURES
// ============================================================
var w4 = addWs("04 Salary Structures", "8B5CF6");
var c4 = [
  { k: "empId", h: "Employee ID *", m: 1, w: 18 },
  { k: "empName", h: "Employee Name (ref)", m: 0, w: 26 },
  { k: "effectiveFrom", h: "Effective From *\n(YYYY-MM-DD)", m: 1, w: 22 },
  { k: "ctc", h: "CTC Annual (Rs) *", m: 1, w: 22 },
  { k: "basic", h: "Basic Monthly (Rs) *", m: 1, w: 26 },
  { k: "hra", h: "HRA Monthly (Rs) *", m: 1, w: 22 },
  { k: "special", h: "Special Allowance Monthly (Rs) *", m: 1, w: 32 },
  { k: "pfEligible", h: "PF Eligible?\n(TRUE/FALSE)", m: 0, w: 20 },
  { k: "esiEligible", h: "ESI Eligible?\n(TRUE if gross <= 21000/month)", m: 0, w: 30 },
  { k: "notes", h: "Notes", m: 0, w: 35 }
];
headers(w4, "Salary Structures — One row per employee per revision", c4);
addRows(w4, c4, [
  { empId:"NAP-001",empName:"Pradeep Chandra",effectiveFrom:"2024-04-01",ctc:"5400000",basic:"225000",hra:"112500",special:"112500",pfEligible:"FALSE",esiEligible:"FALSE",notes:"CEO Package — no PF/ESI" },
  { empId:"NAP-002",empName:"Lokesh Reddy",effectiveFrom:"2024-04-01",ctc:"4200000",basic:"175000",hra:"87500",special:"87500",pfEligible:"FALSE",esiEligible:"FALSE",notes:"CTO Package" },
  { empId:"NAP-003",empName:"Tejesh Kumar Vemula",effectiveFrom:"2024-04-01",ctc:"1200000",basic:"50000",hra:"25000",special:"25000",pfEligible:"TRUE",esiEligible:"FALSE",notes:"HR Manager" },
  { empId:"NAP-004",empName:"Anusha Pillai",effectiveFrom:"2024-04-01",ctc:"960000",basic:"40000",hra:"20000",special:"20000",pfEligible:"TRUE",esiEligible:"FALSE",notes:"Senior Software Engineer" },
  { empId:"NAP-005",empName:"Karthik Menon",effectiveFrom:"2024-04-01",ctc:"1440000",basic:"60000",hra:"30000",special:"30000",pfEligible:"TRUE",esiEligible:"FALSE",notes:"Tech Lead" }
]);

// ============================================================
// SHEET 5: LEAVE TYPES
// ============================================================
var w5 = addWs("05 Leave Types", "10B981");
var c5 = [
  { k: "code", h: "Leave Code *\n(unique e.g. EL)", m: 1, w: 16 },
  { k: "name", h: "Leave Name *", m: 1, w: 30 },
  { k: "maxDays", h: "Max Days/Year *", m: 1, w: 20 },
  { k: "isPaid", h: "Paid?\n(TRUE/FALSE)", m: 1, w: 18 },
  { k: "carryFwd", h: "Carry Forward?\n(TRUE/FALSE)", m: 1, w: 22 },
  { k: "maxCarry", h: "Max Carry Forward Days\n(blank = none allowed)", m: 0, w: 28 },
  { k: "docAbove", h: "Doc Required if > X Days\n(blank = never required)", m: 0, w: 32 },
  { k: "isActive", h: "Active?\n(TRUE/FALSE)", m: 0, w: 18 }
];
headers(w5, "Leave Types Configuration", c5);
addRows(w5, c5, [
  { code:"EL",name:"Earned Leave",maxDays:"18",isPaid:"TRUE",carryFwd:"TRUE",maxCarry:"15",docAbove:"",isActive:"TRUE" },
  { code:"SL",name:"Sick Leave",maxDays:"12",isPaid:"TRUE",carryFwd:"FALSE",maxCarry:"",docAbove:"3",isActive:"TRUE" },
  { code:"CL",name:"Casual Leave",maxDays:"12",isPaid:"TRUE",carryFwd:"FALSE",maxCarry:"",docAbove:"",isActive:"TRUE" },
  { code:"ML",name:"Maternity Leave",maxDays:"182",isPaid:"TRUE",carryFwd:"FALSE",maxCarry:"",docAbove:"1",isActive:"TRUE" },
  { code:"PL",name:"Paternity Leave",maxDays:"15",isPaid:"TRUE",carryFwd:"FALSE",maxCarry:"",docAbove:"",isActive:"TRUE" },
  { code:"LOP",name:"Loss of Pay",maxDays:"365",isPaid:"FALSE",carryFwd:"FALSE",maxCarry:"",docAbove:"",isActive:"TRUE" },
  { code:"COMP",name:"Compensatory Off",maxDays:"10",isPaid:"TRUE",carryFwd:"TRUE",maxCarry:"5",docAbove:"",isActive:"TRUE" },
  { code:"BL",name:"Bereavement Leave",maxDays:"5",isPaid:"TRUE",carryFwd:"FALSE",maxCarry:"",docAbove:"1",isActive:"TRUE" },
  { code:"FL",name:"Floater / Festival Leave",maxDays:"3",isPaid:"TRUE",carryFwd:"FALSE",maxCarry:"",docAbove:"",isActive:"TRUE" }
]);

// ============================================================
// SHEET 6: ASSETS INVENTORY
// ============================================================
var w6 = addWs("06 Assets Inventory", "F59E0B");
var c6 = [
  { k: "tag",      h: "Asset Tag *\n(unique e.g. NAP-LAP-001)",                                      m: 1, w: 26 },
  { k: "name",     h: "Asset Name *",                                                                m: 1, w: 32 },
  { k: "cat",      h: "Category *\n(LAPTOP/DESKTOP/MONITOR/MOBILE_DEVICE/SIM/ACCESS_CARD/SOFTWARE_LICENCE/CLOUD_ACCOUNT/OTHER)", m: 1, w: 48 },
  { k: "brand",    h: "Brand",                                                                       m: 0, w: 18 },
  { k: "model",    h: "Model",                                                                       m: 0, w: 22 },
  { k: "serial",   h: "Serial Number\n(unique per device)",                                          m: 0, w: 26 },
  { k: "cost",     h: "Purchase Cost (Rs)",                                                          m: 0, w: 22 },
  { k: "purchDate",h: "Purchase Date\n(YYYY-MM-DD)",                                                 m: 0, w: 22 },
  { k: "status",   h: "Status *\n(AVAILABLE/ASSIGNED/LOST/DAMAGED/REPLACED/RETIRED)",               m: 1, w: 40 },
  { k: "holder",   h: "Assigned To Emp ID\n(if status = ASSIGNED)",                                 m: 0, w: 30 },
  { k: "notes",    h: "Notes",                                                                       m: 0, w: 35 }
];
headers(w6, "IT Assets Inventory", c6);
addRows(w6, c6, [
  { tag:"NAP-LAP-001",name:"Dell Latitude 5530 — CEO",cat:"LAPTOP",brand:"Dell",model:"Latitude 5530",serial:"DLAT5530CEO001",cost:"95000",purchDate:"2023-01-15",status:"ASSIGNED",holder:"NAP-001",notes:"15.6in FHD i7 16GB 512GB SSD" },
  { tag:"NAP-LAP-002",name:"MacBook Pro 14in — CTO",cat:"LAPTOP",brand:"Apple",model:"MacBook Pro M3",serial:"APPMBP14CTO001",cost:"195000",purchDate:"2023-06-01",status:"ASSIGNED",holder:"NAP-002",notes:"M3 Pro 18GB 512GB" },
  { tag:"NAP-LAP-003",name:"HP EliteBook 840 G9 — HR Mgr",cat:"LAPTOP",brand:"HP",model:"EliteBook 840 G9",serial:"HPELB840003",cost:"75000",purchDate:"2023-03-10",status:"ASSIGNED",holder:"NAP-003",notes:"14in FHD i5 8GB" },
  { tag:"NAP-LAP-004",name:"Lenovo ThinkPad E15 — SSE",cat:"LAPTOP",brand:"Lenovo",model:"ThinkPad E15",serial:"LNVTPE15004",cost:"65000",purchDate:"2023-03-15",status:"ASSIGNED",holder:"NAP-004",notes:"15.6in i5 8GB" },
  { tag:"NAP-LAP-005",name:"Dell Latitude 5540 — Tech Lead",cat:"LAPTOP",brand:"Dell",model:"Latitude 5540",serial:"DLAT5540005",cost:"88000",purchDate:"2023-04-01",status:"ASSIGNED",holder:"NAP-005",notes:"15.6in i7 16GB" },
  { tag:"NAP-LAP-006",name:"Dell Latitude 3540 — Spare",cat:"LAPTOP",brand:"Dell",model:"Latitude 3540",serial:"DLAT3540SPARE01",cost:"55000",purchDate:"2024-01-10",status:"AVAILABLE",holder:"",notes:"For new joinee allocation" },
  { tag:"NAP-MON-001",name:"Dell 27in UltraSharp — CEO",cat:"MONITOR",brand:"Dell",model:"U2722D",serial:"DLU2722D001",cost:"35000",purchDate:"2022-11-20",status:"ASSIGNED",holder:"NAP-001",notes:"4K USB-C" },
  { tag:"NAP-SIM-001",name:"Airtel Corporate SIM — CEO",cat:"SIM",brand:"Airtel",model:"Corporate 5G",serial:"896491012345678901",cost:"500",purchDate:"2020-01-01",status:"ASSIGNED",holder:"NAP-001",notes:"Unlimited + 50GB data" },
  { tag:"NAP-ACC-001",name:"Office Access Card — NAP-001",cat:"ACCESS_CARD",brand:"HID",model:"iCLASS SE",serial:"HIDACC001",cost:"800",purchDate:"2020-01-15",status:"ASSIGNED",holder:"NAP-001",notes:"All-floor access" },
  { tag:"NAP-SW-001",name:"Adobe Creative Cloud License",cat:"SOFTWARE_LICENCE",brand:"Adobe",model:"Creative Cloud All Apps",serial:"ADOBECC001",cost:"54000",purchDate:"2024-01-01",status:"ASSIGNED",holder:"NAP-004",notes:"Annual subscription" }
]);

// ============================================================
// SHEET 7: COMPANY HOLIDAYS
// ============================================================
var w7 = addWs("07 Company Holidays", "06B6D4");
var c7 = [
  { k: "date", h: "Holiday Date *\n(YYYY-MM-DD)", m: 1, w: 22 },
  { k: "name", h: "Holiday Name *", m: 1, w: 38 },
  { k: "desc", h: "Description / Notes", m: 0, w: 48 }
];
headers(w7, "Company Holiday Calendar 2025", c7);
addRows(w7, c7, [
  { date:"2025-01-26",name:"Republic Day",desc:"National Holiday — Gazetted" },
  { date:"2025-03-14",name:"Holi",desc:"Festival of Colors" },
  { date:"2025-03-30",name:"Ugadi",desc:"Telugu New Year — Regional Holiday Telangana/AP" },
  { date:"2025-04-14",name:"Ambedkar Jayanti",desc:"National Holiday" },
  { date:"2025-04-18",name:"Good Friday",desc:"Optional — Christian Holiday" },
  { date:"2025-05-01",name:"May Day",desc:"International Labour Day" },
  { date:"2025-08-15",name:"Independence Day",desc:"National Holiday — Gazetted" },
  { date:"2025-08-27",name:"Ganesh Chaturthi",desc:"Festival Holiday" },
  { date:"2025-10-02",name:"Gandhi Jayanti",desc:"National Holiday — Gazetted" },
  { date:"2025-10-02",name:"Dussehra",desc:"Festival Holiday" },
  { date:"2025-10-20",name:"Diwali",desc:"Festival of Lights" },
  { date:"2025-12-25",name:"Christmas",desc:"Optional — Christian Holiday" }
]);

// ============================================================
// SHEET 8: SKILLS LIBRARY
// ============================================================
var w8 = addWs("08 Skills Library", "6366F1");
var c8 = [
  { k: "name", h: "Skill Name *\n(unique)", m: 1, w: 32 },
  { k: "cat", h: "Category *\n(TECHNICAL/SOFT/LEADERSHIP/DOMAIN)", m: 1, w: 35 },
  { k: "sub", h: "Subcategory\n(e.g. Backend/Frontend/QA/Sales/HR)", m: 0, w: 32 }
];
headers(w8, "Skills Master Library", c8);
addRows(w8, c8, [
  {name:"Python",cat:"TECHNICAL",sub:"Backend"},{name:"JavaScript",cat:"TECHNICAL",sub:"Full Stack"},
  {name:"TypeScript",cat:"TECHNICAL",sub:"Full Stack"},{name:"React.js",cat:"TECHNICAL",sub:"Frontend"},
  {name:"Next.js",cat:"TECHNICAL",sub:"Frontend"},{name:"Node.js",cat:"TECHNICAL",sub:"Backend"},
  {name:"NestJS",cat:"TECHNICAL",sub:"Backend"},{name:"PostgreSQL",cat:"TECHNICAL",sub:"Database"},
  {name:"MySQL",cat:"TECHNICAL",sub:"Database"},{name:"MongoDB",cat:"TECHNICAL",sub:"Database"},
  {name:"Redis",cat:"TECHNICAL",sub:"Infrastructure"},{name:"Docker",cat:"TECHNICAL",sub:"DevOps"},
  {name:"AWS",cat:"TECHNICAL",sub:"Cloud"},{name:"Git",cat:"TECHNICAL",sub:"DevOps"},
  {name:"REST API Design",cat:"TECHNICAL",sub:"Backend"},{name:"GraphQL",cat:"TECHNICAL",sub:"Backend"},
  {name:"Selenium",cat:"TECHNICAL",sub:"QA"},{name:"Postman",cat:"TECHNICAL",sub:"QA"},
  {name:"Figma",cat:"TECHNICAL",sub:"Design"},{name:"Power BI",cat:"TECHNICAL",sub:"Analytics"},
  {name:"Tally / ERP",cat:"TECHNICAL",sub:"Finance"},{name:"MS Office Suite",cat:"TECHNICAL",sub:"Productivity"},
  {name:"Communication",cat:"SOFT",sub:"Interpersonal"},{name:"Teamwork",cat:"SOFT",sub:"Interpersonal"},
  {name:"Problem Solving",cat:"SOFT",sub:"Cognitive"},{name:"Time Management",cat:"SOFT",sub:"Productivity"},
  {name:"Negotiation",cat:"SOFT",sub:"Sales / HR"},{name:"Presentation Skills",cat:"SOFT",sub:"Communication"},
  {name:"Leadership",cat:"LEADERSHIP",sub:"People Management"},{name:"Strategic Planning",cat:"LEADERSHIP",sub:"Management"},
  {name:"Conflict Resolution",cat:"LEADERSHIP",sub:"People Management"},
  {name:"Dental Industry Knowledge",cat:"DOMAIN",sub:"Healthcare"},{name:"CRM Tools",cat:"DOMAIN",sub:"Sales"},
  {name:"HR Policies & Compliance",cat:"DOMAIN",sub:"HR"},{name:"Financial Accounting",cat:"DOMAIN",sub:"Finance"},
  {name:"B2B Sales",cat:"DOMAIN",sub:"Sales"}
]);

// ============================================================
// SHEET 9: EMPLOYEE SKILLS MAP
// ============================================================
var w9 = addWs("09 Employee Skills Map", "0891B2");
var c9 = [
  { k: "empId", h: "Employee ID *", m: 1, w: 18 },
  { k: "empName", h: "Employee Name (ref)", m: 0, w: 26 },
  { k: "skill", h: "Skill Name *\n(from Skills Library)", m: 1, w: 32 },
  { k: "level", h: "Proficiency *\n(BEGINNER/INTERMEDIATE/ADVANCED/EXPERT)", m: 1, w: 38 },
  { k: "years", h: "Years of Experience\n(e.g. 2.5)", m: 0, w: 25 },
  { k: "verified", h: "Verified?\n(TRUE/FALSE)", m: 0, w: 18 }
];
headers(w9, "Employee Skills Mapping — One row per employee-skill", c9);
addRows(w9, c9, [
  {empId:"NAP-002",empName:"Lokesh Reddy",skill:"TypeScript",level:"EXPERT",years:"8",verified:"TRUE"},
  {empId:"NAP-002",empName:"Lokesh Reddy",skill:"NestJS",level:"EXPERT",years:"5",verified:"TRUE"},
  {empId:"NAP-002",empName:"Lokesh Reddy",skill:"AWS",level:"ADVANCED",years:"6",verified:"TRUE"},
  {empId:"NAP-002",empName:"Lokesh Reddy",skill:"PostgreSQL",level:"ADVANCED",years:"6",verified:"TRUE"},
  {empId:"NAP-003",empName:"Tejesh Kumar Vemula",skill:"HR Policies & Compliance",level:"ADVANCED",years:"5",verified:"TRUE"},
  {empId:"NAP-003",empName:"Tejesh Kumar Vemula",skill:"Communication",level:"EXPERT",years:"5",verified:"TRUE"},
  {empId:"NAP-004",empName:"Anusha Pillai",skill:"React.js",level:"ADVANCED",years:"4",verified:"TRUE"},
  {empId:"NAP-004",empName:"Anusha Pillai",skill:"TypeScript",level:"INTERMEDIATE",years:"3",verified:"FALSE"},
  {empId:"NAP-005",empName:"Karthik Menon",skill:"Node.js",level:"EXPERT",years:"7",verified:"TRUE"},
  {empId:"NAP-005",empName:"Karthik Menon",skill:"PostgreSQL",level:"ADVANCED",years:"5",verified:"TRUE"},
  {empId:"NAP-005",empName:"Karthik Menon",skill:"Leadership",level:"ADVANCED",years:"3",verified:"TRUE"}
]);

// ============================================================
// SHEET 10: JOBS (RECRUITMENT)
// ============================================================
var w10 = addWs("10 Jobs (Recruitment)", "EC4899");
var c10 = [
  { k: "title", h: "Job Title *", m: 1, w: 38 },
  { k: "dept", h: "Department *", m: 1, w: 30 },
  { k: "hiringMgr", h: "Hiring Mgr Emp ID *", m: 1, w: 26 },
  { k: "jd", h: "Job Description *", m: 1, w: 55 },
  { k: "minExp", h: "Min Exp Years *", m: 1, w: 18 },
  { k: "maxExp", h: "Max Exp Years *", m: 1, w: 18 },
  { k: "openings", h: "Open Positions *", m: 1, w: 20 },
  { k: "ctcMin", h: "CTC Min Annual (Rs)", m: 0, w: 22 },
  { k: "ctcMax", h: "CTC Max Annual (Rs)", m: 0, w: 22 },
  { k: "skills", h: "Required Skills\n(comma separated)", m: 0, w: 45 },
  { k: "targetDate", h: "Target Fill Date\n(YYYY-MM-DD)", m: 0, w: 22 },
  { k: "status", h: "Status\n(DRAFT/OPEN/CLOSED/ON_HOLD)", m: 0, w: 28 }
];
headers(w10, "Job Openings for Recruitment Module", c10);
addRows(w10, c10, [
  {title:"Senior Software Engineer — Backend",dept:"Software Development",hiringMgr:"NAP-005",jd:"Build high-performance backend microservices using Node.js NestJS PostgreSQL. Strong REST API and AWS skills required.",minExp:"3",maxExp:"6",openings:"2",ctcMin:"800000",ctcMax:"1400000",skills:"Node.js, TypeScript, PostgreSQL, AWS",targetDate:"2025-02-28",status:"OPEN"},
  {title:"React.js Frontend Developer",dept:"Software Development",hiringMgr:"NAP-005",jd:"Develop responsive frontend apps using React.js TypeScript. Next.js experience preferred.",minExp:"2",maxExp:"5",openings:"1",ctcMin:"600000",ctcMax:"1200000",skills:"React.js, TypeScript, Next.js",targetDate:"2025-03-15",status:"OPEN"},
  {title:"QA Engineer",dept:"Quality Assurance",hiringMgr:"NAP-002",jd:"Design and execute test plans. Write automated test cases for web applications.",minExp:"1",maxExp:"4",openings:"1",ctcMin:"400000",ctcMax:"800000",skills:"Selenium, Postman, Manual Testing",targetDate:"2025-03-31",status:"OPEN"},
  {title:"HR Executive",dept:"Human Resources",hiringMgr:"NAP-003",jd:"Support HR operations including onboarding payroll compliance and employee engagement.",minExp:"1",maxExp:"3",openings:"1",ctcMin:"350000",ctcMax:"550000",skills:"HR Policies, Communication, MS Office",targetDate:"2025-02-15",status:"DRAFT"},
  {title:"Sales Executive — Dental Distribution",dept:"Sales & Business Development",hiringMgr:"NAP-001",jd:"Drive B2B sales of dental implant products to clinics hospitals and distributors.",minExp:"2",maxExp:"5",openings:"3",ctcMin:"400000",ctcMax:"700000",skills:"B2B Sales, CRM Tools, Dental Industry Knowledge",targetDate:"2025-04-30",status:"OPEN"}
]);

// ============================================================
// SHEET 11: CANDIDATES
// ============================================================
var w11 = addWs("11 Candidates", "BE185D");
var c11 = [
  { k: "jobTitle", h: "Job Applied For *", m: 1, w: 40 },
  { k: "name", h: "Candidate Name *", m: 1, w: 28 },
  { k: "email", h: "Email *", m: 1, w: 30 },
  { k: "phone", h: "Phone *", m: 1, w: 18 },
  { k: "currCTC", h: "Current CTC\nAnnual (Rs)", m: 0, w: 22 },
  { k: "expCTC", h: "Expected CTC\nAnnual (Rs)", m: 0, w: 22 },
  { k: "notice", h: "Notice Period\n(Days e.g. 30/60/90)", m: 0, w: 24 },
  { k: "skills", h: "Key Skills\n(comma separated)", m: 0, w: 42 },
  { k: "source", h: "Source\n(LinkedIn/Naukri/Referral/Direct/Instahyre)", m: 0, w: 36 },
  { k: "stage", h: "Stage\n(APPLIED/SCREENING/INTERVIEW/OFFER/JOINED/REJECTED)", m: 0, w: 42 },
  { k: "resumeUrl", h: "Resume URL / S3 Path", m: 0, w: 44 }
];
headers(w11, "Candidate Pipeline", c11);
addRows(w11, c11, [
  {jobTitle:"Senior Software Engineer — Backend",name:"Rahul Sharma",email:"rahul.sharma@gmail.com",phone:"9988776655",currCTC:"700000",expCTC:"1100000",notice:"60",skills:"Node.js, TypeScript, PostgreSQL",source:"LinkedIn",stage:"INTERVIEW",resumeUrl:""},
  {jobTitle:"React.js Frontend Developer",name:"Priya Nair",email:"priya.nair@gmail.com",phone:"9876512345",currCTC:"550000",expCTC:"900000",notice:"30",skills:"React.js, JavaScript, CSS",source:"Naukri",stage:"SCREENING",resumeUrl:""},
  {jobTitle:"Sales Executive — Dental Distribution",name:"Suresh Babu",email:"suresh.b@gmail.com",phone:"9800123456",currCTC:"420000",expCTC:"600000",notice:"30",skills:"B2B Sales, Communication",source:"Referral",stage:"APPLIED",resumeUrl:""},
  {jobTitle:"QA Engineer",name:"Meera Krishnan",email:"meera.k@gmail.com",phone:"9765432100",currCTC:"380000",expCTC:"600000",notice:"30",skills:"Selenium, Manual Testing",source:"Naukri",stage:"APPLIED",resumeUrl:""}
]);

// ============================================================
// SHEET 12: COURSES & LEARNING
// ============================================================
var w12 = addWs("12 Courses & Learning", "14B8A6");
var c12 = [
  { k: "title", h: "Course Title *", m: 1, w: 42 },
  { k: "cat", h: "Category *\n(Technical/Leadership/Compliance/Domain)", m: 1, w: 32 },
  { k: "provider", h: "Provider *\n(Internal/Coursera/Udemy/AWS etc.)", m: 1, w: 30 },
  { k: "hours", h: "Duration Hours *", m: 1, w: 20 },
  { k: "isInternal", h: "Internal?\n(TRUE/FALSE)", m: 0, w: 18 },
  { k: "url", h: "Course URL\n(for external courses)", m: 0, w: 52 },
  { k: "desc", h: "Description", m: 0, w: 55 },
  { k: "isActive", h: "Active?\n(TRUE/FALSE)", m: 0, w: 18 }
];
headers(w12, "Learning Management — Course Catalog", c12);
addRows(w12, c12, [
  {title:"NestJS Fundamentals",cat:"Technical",provider:"Internal",hours:"12",isInternal:"TRUE",url:"",desc:"Intro to NestJS decorators modules and guards.",isActive:"TRUE"},
  {title:"AWS Cloud Practitioner",cat:"Technical",provider:"AWS Training",hours:"40",isInternal:"FALSE",url:"https://aws.amazon.com/training/",desc:"AWS Certified Cloud Practitioner foundation course.",isActive:"TRUE"},
  {title:"Leadership Essentials for First-Time Managers",cat:"Leadership",provider:"Internal",hours:"8",isInternal:"TRUE",url:"",desc:"Building leadership skills for new managers.",isActive:"TRUE"},
  {title:"POSH Act Compliance Training",cat:"Compliance",provider:"Internal",hours:"3",isInternal:"TRUE",url:"",desc:"Mandatory Prevention of Sexual Harassment training.",isActive:"TRUE"},
  {title:"React Advanced Patterns",cat:"Technical",provider:"Udemy",hours:"20",isInternal:"FALSE",url:"https://www.udemy.com/course/react-advanced/",desc:"Advanced React hooks patterns and performance optimization.",isActive:"TRUE"},
  {title:"Data Privacy & DPDPA Compliance",cat:"Compliance",provider:"Internal",hours:"4",isInternal:"TRUE",url:"",desc:"India Digital Personal Data Protection Act 2023 compliance.",isActive:"TRUE"},
  {title:"Dental Implant Products Overview",cat:"Domain",provider:"Internal",hours:"6",isInternal:"TRUE",url:"",desc:"Product knowledge training for sales and CEM teams.",isActive:"TRUE"}
]);

// ============================================================
// SHEET 13: PROJECTS
// ============================================================
var w13 = addWs("13 Projects", "F97316");
var c13 = [
  { k: "name", h: "Project Name *", m: 1, w: 32 },
  { k: "key", h: "Project Key *\n(unique e.g. NAP-EMS)", m: 1, w: 22 },
  { k: "desc", h: "Description", m: 0, w: 50 },
  { k: "status", h: "Status\n(ACTIVE/COMPLETED/ON_HOLD)", m: 0, w: 28 },
  { k: "start", h: "Start Date\n(YYYY-MM-DD)", m: 0, w: 22 },
  { k: "end", h: "End Date\n(YYYY-MM-DD)", m: 0, w: 22 },
  { k: "members", h: "Team Member Emp IDs\n(comma separated)", m: 0, w: 44 },
  { k: "roles", h: "Project Roles (same order as members)\n(DM/SPM/PM/TL/TR/TS/QA/QE/QM/MEMBER)", m: 0, w: 52 }
];
headers(w13, "Projects Master — Task Management", c13);
addRows(w13, c13, [
  {name:"Naprocs EMS Platform",key:"NAP-EMS",desc:"Enterprise Management System for HR Payroll Attendance and Operations.",status:"ACTIVE",start:"2024-01-01",end:"2025-12-31",members:"NAP-002, NAP-003, NAP-004, NAP-005",roles:"DM, PM, TR, TL"},
  {name:"CRM & CEM Portal",key:"NAP-CRM",desc:"Client Engagement and CRM portal for sales and client management teams.",status:"ACTIVE",start:"2024-03-01",end:"2025-06-30",members:"NAP-002, NAP-005",roles:"DM, TL"},
  {name:"Dental Product Website",key:"NAP-WEB",desc:"Redesign of company product showcase website.",status:"ACTIVE",start:"2024-06-01",end:"2025-03-31",members:"NAP-004, NAP-005",roles:"TR, TL"}
]);

// ============================================================
// SHEET 14: REVIEW CYCLES
// ============================================================
var w14 = addWs("14 Review Cycles", "0EA5E9");
var c14 = [
  { k: "name", h: "Cycle Name *", m: 1, w: 32 },
  { k: "type", h: "Type *\n(QUARTERLY/HALF_YEARLY/ANNUAL)", m: 1, w: 30 },
  { k: "year", h: "Year *\n(e.g. 2025)", m: 1, w: 16 },
  { k: "quarter", h: "Quarter\n(1-4, only if QUARTERLY)", m: 0, w: 22 },
  { k: "start", h: "Start Date *\n(YYYY-MM-DD)", m: 1, w: 22 },
  { k: "end", h: "End Date *\n(YYYY-MM-DD)", m: 1, w: 22 },
  { k: "status", h: "Status\n(UPCOMING/ACTIVE/COMPLETED)", m: 0, w: 28 }
];
headers(w14, "Performance Review Cycles", c14);
addRows(w14, c14, [
  {name:"Q1 FY 2024-25 Review",type:"QUARTERLY",year:"2024",quarter:"1",start:"2024-07-01",end:"2024-09-30",status:"COMPLETED"},
  {name:"Q2 FY 2024-25 Review",type:"QUARTERLY",year:"2024",quarter:"2",start:"2024-10-01",end:"2024-12-31",status:"COMPLETED"},
  {name:"Q3 FY 2024-25 Review",type:"QUARTERLY",year:"2025",quarter:"3",start:"2025-01-01",end:"2025-03-31",status:"ACTIVE"},
  {name:"H1 FY 2024-25 Half Yearly",type:"HALF_YEARLY",year:"2024",quarter:"",start:"2024-07-01",end:"2024-12-31",status:"COMPLETED"},
  {name:"Annual Performance Review FY 2024-25",type:"ANNUAL",year:"2025",quarter:"",start:"2025-04-01",end:"2025-06-30",status:"UPCOMING"}
]);

// ============================================================
// SHEET 15: SURVEYS
// ============================================================
var w15 = addWs("15 Surveys", "7C3AED");
var c15 = [
  { k: "title", h: "Survey Title *", m: 1, w: 42 },
  { k: "type", h: "Type *\n(PULSE/MOOD/EXIT/ONBOARDING/CUSTOM)", m: 1, w: 35 },
  { k: "audience", h: "Audience\n(ALL/DEPARTMENT/TEAM)", m: 0, w: 25 },
  { k: "anon", h: "Anonymous?\n(TRUE/FALSE)", m: 0, w: 20 },
  { k: "start", h: "Start Date\n(YYYY-MM-DD)", m: 0, w: 22 },
  { k: "end", h: "End Date\n(YYYY-MM-DD)", m: 0, w: 22 },
  { k: "status", h: "Status\n(DRAFT/ACTIVE/CLOSED)", m: 0, w: 22 },
  { k: "q1", h: "Sample Question 1\n(actual questions configured in portal)", m: 0, w: 52 },
  { k: "q2", h: "Sample Question 2", m: 0, w: 52 }
];
headers(w15, "Employee Engagement Surveys", c15);
addRows(w15, c15, [
  {title:"Monthly Pulse Check — July 2025",type:"PULSE",audience:"ALL",anon:"TRUE",start:"2025-07-01",end:"2025-07-05",status:"DRAFT",q1:"How satisfied are you with your current role? (1-10)",q2:"Do you have all tools needed to do your job effectively?"},
  {title:"Weekly Mood Survey",type:"MOOD",audience:"ALL",anon:"TRUE",start:"2025-07-21",end:"2025-07-21",status:"DRAFT",q1:"How are you feeling today? (Emoji scale)",q2:"What is one thing that would make your week better?"},
  {title:"Onboarding Experience Feedback",type:"ONBOARDING",audience:"TEAM",anon:"FALSE",start:"2025-07-15",end:"2025-07-20",status:"ACTIVE",q1:"Was your onboarding process smooth and informative?",q2:"Rate the asset allocation and setup experience (1-5)"}
]);

// ============================================================
// SHEET 16: KNOWLEDGE BASE
// ============================================================
var w16 = addWs("16 Knowledge Base", "4F46E5");
var c16 = [
  { k: "title", h: "Document Title *", m: 1, w: 48 },
  { k: "slug", h: "URL Slug *\n(unique e.g. leave-policy-2024)", m: 1, w: 32 },
  { k: "cat", h: "Category *\n(POLICY/SOP/ARCHITECTURE/TECHNICAL_DOC/HR_GUIDELINES/TRAINING_MATERIAL/COMPLIANCE)", m: 1, w: 52 },
  { k: "ver", h: "Version\n(e.g. 1.0)", m: 0, w: 16 },
  { k: "reqSign", h: "Requires Employee Signature?\n(TRUE/FALSE)", m: 0, w: 30 },
  { k: "pub", h: "Published?\n(TRUE/FALSE)", m: 0, w: 20 },
  { k: "authorId", h: "Author Emp ID *", m: 1, w: 22 },
  { k: "summary", h: "Content Summary\n(Actual content entered in portal rich text editor)", m: 0, w: 68 }
];
headers(w16, "Knowledge Base Documents", c16);
addRows(w16, c16, [
  {title:"Leave Policy 2024-25",slug:"leave-policy-2024-25",cat:"POLICY",ver:"2.0",reqSign:"TRUE",pub:"TRUE",authorId:"NAP-003",summary:"Complete leave policy covering EL SL CL Maternity Paternity LOP with carry-forward conditions and eligibility criteria."},
  {title:"Employee Code of Conduct",slug:"code-of-conduct",cat:"HR_GUIDELINES",ver:"1.0",reqSign:"TRUE",pub:"TRUE",authorId:"NAP-003",summary:"Professional behavior ethics and workplace conduct standards for all employees."},
  {title:"Work From Home Policy",slug:"wfh-policy",cat:"POLICY",ver:"1.5",reqSign:"FALSE",pub:"TRUE",authorId:"NAP-003",summary:"WFH request eligibility conditions approval process and guidelines for hybrid work."},
  {title:"POSH Policy",slug:"posh-policy",cat:"COMPLIANCE",ver:"1.0",reqSign:"TRUE",pub:"TRUE",authorId:"NAP-003",summary:"Prevention of Sexual Harassment policy as per POSH Act 2013. Mandatory for all employees."},
  {title:"IT Security Policy",slug:"it-security-policy",cat:"POLICY",ver:"1.0",reqSign:"TRUE",pub:"TRUE",authorId:"NAP-002",summary:"Device usage password policy VPN access and data security guidelines."},
  {title:"Onboarding SOP",slug:"onboarding-sop",cat:"SOP",ver:"1.0",reqSign:"FALSE",pub:"TRUE",authorId:"NAP-003",summary:"Standard operating procedure for new employee onboarding from Day 0 to Day 30."},
  {title:"EMS Architecture Overview",slug:"ems-architecture-overview",cat:"ARCHITECTURE",ver:"1.0",reqSign:"FALSE",pub:"FALSE",authorId:"NAP-002",summary:"Technical architecture documentation for Naprocs EMS platform — internal use only."},
  {title:"Data Privacy & DPDPA Guide",slug:"dpdpa-guide",cat:"COMPLIANCE",ver:"1.0",reqSign:"TRUE",pub:"TRUE",authorId:"NAP-002",summary:"DPDPA 2023 compliance guide for all employees handling personal data."}
]);

// ============================================================
// SHEET 17: GRIEVANCES
// ============================================================
var w17 = addWs("17 Grievances", "B45309");
var c17 = [
  { k: "empId", h: "Employee ID (Subject) *", m: 1, w: 24 },
  { k: "empName", h: "Employee Name (ref)", m: 0, w: 26 },
  { k: "officerId", h: "Grievance Officer Emp ID", m: 0, w: 28 },
  { k: "desc", h: "Grievance Description *", m: 1, w: 65 },
  { k: "status", h: "Status\n(OPEN/IN_PROGRESS/RESOLVED/CLOSED)", m: 0, w: 32 },
  { k: "resolution", h: "Resolution (if resolved)", m: 0, w: 55 },
  { k: "openedAt", h: "Opened Date\n(YYYY-MM-DD)", m: 0, w: 22 }
];
headers(w17, "Grievance Cases — HR Compliance", c17);
addRows(w17, c17, [
  {empId:"NAP-004",empName:"Anusha Pillai",officerId:"NAP-003",desc:"Reporting manager assigns tasks outside agreed scope without prior notice. Multiple instances in past 30 days.",status:"IN_PROGRESS",resolution:"",openedAt:"2025-07-10"}
]);

// ============================================================
// SHEET 18: COMPLIANCE
// ============================================================
var w18 = addWs("18 Compliance", "065F46");
var c18 = [
  { k: "title", h: "Policy Title *", m: 1, w: 42 },
  { k: "url", h: "Policy Document URL *\n(S3 link or external document URL)", m: 1, w: 58 },
  { k: "updatedById", h: "Updated By Emp ID *", m: 1, w: 26 }
];
headers(w18, "Compliance Policies", c18);
addRows(w18, c18, [
  {title:"POSH Policy Document",url:"https://docs.naprocs.in/policies/posh-2024.pdf",updatedById:"NAP-003"},
  {title:"Data Privacy & DPDPA Compliance Policy",url:"https://docs.naprocs.in/policies/dpdpa-2024.pdf",updatedById:"NAP-002"},
  {title:"GST Filing Compliance Checklist",url:"https://docs.naprocs.in/policies/gst-checklist.pdf",updatedById:"NAP-003"},
  {title:"PF & ESI Compliance Policy",url:"https://docs.naprocs.in/policies/pf-esi-2024.pdf",updatedById:"NAP-003"},
  {title:"Gratuity Policy",url:"https://docs.naprocs.in/policies/gratuity-2024.pdf",updatedById:"NAP-003"}
]);

// ============================================================
// SHEET 19: ENUM REFERENCE (Complete Guide)
// ============================================================
var w19 = addWs("19 Enum Reference", "374151");
var c19 = [
  { k: "field", h: "Field / Column Name", m: 0, w: 38 },
  { k: "sheet", h: "Used In Sheet", m: 0, w: 28 },
  { k: "values", h: "Allowed Values", m: 0, w: 95 },
  { k: "notes", h: "Notes / Default", m: 0, w: 52 }
];
headers(w19, "Allowed Values Reference — All Enums", c19);
addRows(w19, c19, [
  {field:"Gender",sheet:"03 Employees Master",values:"MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY",notes:"Case sensitive — use CAPS exactly as shown"},
  {field:"Marital Status",sheet:"03 Employees Master",values:"SINGLE | MARRIED | DIVORCED | WIDOWED",notes:""},
  {field:"Employee Type",sheet:"03 Employees Master",values:"FULL_TIME | PART_TIME | CONTRACT | INTERN",notes:"Default = FULL_TIME"},
  {field:"Employee Status",sheet:"03 Employees Master",values:"PROBATION | ACTIVE | NOTICE_PERIOD | EXITED | ONBOARDING | CANCELLED",notes:"New joinee start as: ONBOARDING or PROBATION"},
  {field:"System Role",sheet:"03 Employees Master",values:"SUPER_ADMIN | CEO | CTO | COO | OPERATIONS_HEAD | CFO | CHRO | HR | FINANCE | MANAGER | TEAM_LEAD | EMPLOYEE | IT | CEM | OE | OM | CRM",notes:"Controls which dashboard the employee sees. Default = EMPLOYEE"},
  {field:"Blood Group",sheet:"03 Employees Master",values:"A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",notes:""},
  {field:"Payment Mode",sheet:"03 Employees Master",values:"NEFT | IMPS | RTGS",notes:"NEFT recommended for salary disbursement"},
  {field:"Account Type",sheet:"03 Employees Master",values:"SAVINGS | CURRENT",notes:"Most employees use SAVINGS"},
  {field:"Background Verified",sheet:"03 Employees Master",values:"TRUE | FALSE",notes:"FALSE until BGV process completed"},
  {field:"PF Eligible",sheet:"04 Salary Structures",values:"TRUE | FALSE",notes:"FALSE for high-salary executives (typically CTC > 15 LPA)"},
  {field:"ESI Eligible",sheet:"04 Salary Structures",values:"TRUE | FALSE",notes:"TRUE only if gross salary <= Rs.21000/month"},
  {field:"Leave isPaid",sheet:"05 Leave Types",values:"TRUE | FALSE",notes:"FALSE for LOP (Loss of Pay)"},
  {field:"Leave isCarryForward",sheet:"05 Leave Types",values:"TRUE | FALSE",notes:""},
  {field:"Asset Category",sheet:"06 Assets Inventory",values:"LAPTOP | DESKTOP | MONITOR | MOBILE_DEVICE | SIM | ACCESS_CARD | SOFTWARE_LICENCE | CLOUD_ACCOUNT | OTHER",notes:""},
  {field:"Asset Status",sheet:"06 Assets Inventory",values:"AVAILABLE | ASSIGNED | LOST | DAMAGED | REPLACED | RETIRED",notes:"AVAILABLE = ready to assign to next employee"},
  {field:"Job Status",sheet:"10 Jobs (Recruitment)",values:"DRAFT | OPEN | CLOSED | ON_HOLD",notes:"Start with DRAFT. Set to OPEN to make visible in pipeline"},
  {field:"Candidate Stage",sheet:"11 Candidates",values:"APPLIED | SCREENING | INTERVIEW | OFFER | JOINED | REJECTED",notes:"Progression: APPLIED → SCREENING → INTERVIEW → OFFER → JOINED"},
  {field:"Skill Category",sheet:"08 Skills Library",values:"TECHNICAL | SOFT | LEADERSHIP | DOMAIN",notes:""},
  {field:"Proficiency Level",sheet:"09 Employee Skills Map",values:"BEGINNER | INTERMEDIATE | ADVANCED | EXPERT",notes:""},
  {field:"Review Cycle Type",sheet:"14 Review Cycles",values:"QUARTERLY | HALF_YEARLY | ANNUAL",notes:""},
  {field:"Review Cycle Status",sheet:"14 Review Cycles",values:"UPCOMING | ACTIVE | COMPLETED",notes:""},
  {field:"Survey Type",sheet:"15 Surveys",values:"PULSE | MOOD | EXIT | ONBOARDING | CUSTOM",notes:"PULSE = regular morale check. MOOD = quick daily check"},
  {field:"Survey Audience",sheet:"15 Surveys",values:"ALL | DEPARTMENT | TEAM",notes:""},
  {field:"Survey Status",sheet:"15 Surveys",values:"DRAFT | ACTIVE | CLOSED",notes:""},
  {field:"Knowledge Category",sheet:"16 Knowledge Base",values:"POLICY | SOP | ARCHITECTURE | TECHNICAL_DOC | HR_GUIDELINES | TRAINING_MATERIAL | COMPLIANCE",notes:""},
  {field:"Project Status",sheet:"13 Projects",values:"ACTIVE | COMPLETED | ON_HOLD",notes:""},
  {field:"Project Role",sheet:"13 Projects",values:"DM | SPM | PM | TL | TR | TS | QA | QE | QM | SDM | ITM | ITE | MEMBER",notes:"DM=Delivery Manager PM=Project Manager TL=Tech Lead TR=Tech Resource TS=Tech Senior QA/QE/QM=QA roles"},
  {field:"Grievance Status",sheet:"17 Grievances",values:"OPEN | IN_PROGRESS | RESOLVED | CLOSED",notes:""},
  {field:"Attendance Status (auto)",sheet:"System auto-calculated",values:"PRESENT | ABSENT | HALF_DAY | HOLIDAY | WFH | ON_LEAVE | EARLY_CHECKOUT | LATE",notes:"Auto-calculated by system from punch data — do NOT manually set in DB"},
  {field:"Check-In Method (auto)",sheet:"System auto-set",values:"WEB | MOBILE | MANUAL",notes:"Auto-set by system when employee punches in"},
  {field:"Leave Request Status (auto)",sheet:"System auto-set",values:"PENDING | APPROVED | REJECTED | CANCELLED",notes:"Auto-updated by approval workflow"},
  {field:"Payroll Run Status (auto)",sheet:"System auto-set",values:"PENDING | PROCESSING | COMPLETED | FAILED",notes:"Auto-managed during payroll run by Finance"},
  {field:"Task Status",sheet:"Project Task Boards",values:"TODO | IN_PROGRESS | IN_REVIEW | QA | DONE | BLOCKED",notes:"Managed via project Kanban board in portal"},
  {field:"Task Type",sheet:"Project Task Boards",values:"STORY | TASK | BUG | EPIC | DAILY_TASK | WEEKLY_TASK_SHEET",notes:""},
  {field:"Task Priority",sheet:"Project Task Boards",values:"LOW | MEDIUM | HIGH",notes:"Default = MEDIUM"},
  {field:"Onboarding Stage (auto)",sheet:"System auto-progressed",values:"OFFER_ACCEPTED | DOCUMENTATION | ASSET_ALLOCATION | TRAINING | MANAGER_INTRO | COMPLETED | CANCELLED",notes:"Auto-progressed by HR via onboarding workflow"},
  {field:"Recognition Type (Engagement)",sheet:"Engagement Module",values:"KUDOS | AWARD | BADGE",notes:"Used in peer-to-peer recognition feature"},
  {field:"Goal Type (Performance)",sheet:"Performance Module",values:"OKR | KPI | PERSONAL",notes:"OKR = Objective & Key Result; KPI = Key Performance Indicator"},
  {field:"Goal Status (Performance)",sheet:"Performance Module",values:"NOT_STARTED | IN_PROGRESS | COMPLETED | MISSED",notes:""},
  {field:"Succession Readiness (Phase 2)",sheet:"Succession Module",values:"READY_NOW | READY_1_YEAR | READY_2_YEARS | DEVELOPING",notes:"Phase 2 feature — unlocked via PHASE_2_ENABLED=true"},
  {field:"AI Risk Level (Phase 3)",sheet:"AI Module",values:"LOW | MEDIUM | HIGH | CRITICAL",notes:"Phase 3 AI attrition risk score — unlocked via PHASE_3_ENABLED=true"}
]);

// ============================================================
// SHEET 20: ATTENDANCE RECORDS (Login / Logout / Status)
// ============================================================
var w20 = addWs("20 Attendance Records", "0F766E");
var c20 = [
  { k: "empId",         h: "Employee ID *\n(e.g. NAP-001)",                                          m: 1, w: 18 },
  { k: "empName",       h: "Employee Name (reference only)",                                         m: 0, w: 26 },
  { k: "date",          h: "Date *\n(YYYY-MM-DD)",                                                   m: 1, w: 22 },
  { k: "checkInTime",   h: "Check-In Time *\n(YYYY-MM-DD HH:MM:SS e.g. 2025-07-01 09:05:00)",       m: 1, w: 38 },
  { k: "checkOutTime",  h: "Check-Out Time\n(YYYY-MM-DD HH:MM:SS e.g. 2025-07-01 18:32:00)",        m: 0, w: 38 },
  { k: "status",        h: "Status *\n(PRESENT/ABSENT/HALF_DAY/WFH/ON_LEAVE/LATE/HOLIDAY/EARLY_CHECKOUT)", m: 1, w: 46 },
  { k: "workHours",     h: "Work Hours\n(e.g. 8.5 — decimal hours)",                                m: 0, w: 22 },
  { k: "checkInMethod", h: "Check-In Method\n(WEB/MOBILE/MANUAL)",                                  m: 0, w: 25 },
  { k: "checkInIp",     h: "Check-In IP Address\n(e.g. 192.168.1.101)",                             m: 0, w: 28 },
  { k: "overtime",      h: "Overtime Hours\n(e.g. 1.5 — blank if none)",                            m: 0, w: 22 },
  { k: "isRegularized", h: "Was it Regularized by HR?\n(TRUE/FALSE)",                               m: 0, w: 28 },
  { k: "notes",         h: "Notes / Regularization Reason\n(leave blank if not regularized)",       m: 0, w: 45 }
];
headers(w20, "Attendance Records — Daily Login/Logout History (CRITICAL for Attendance Trend)", c20);

// Generate 3 months of sample data for 5 employees (NAP-001 to NAP-005)
var attendanceRows = [];
var empIds = [
  {id:"NAP-001",name:"Pradeep Chandra"},
  {id:"NAP-002",name:"Lokesh Reddy"},
  {id:"NAP-003",name:"Tejesh Kumar Vemula"},
  {id:"NAP-004",name:"Anusha Pillai"},
  {id:"NAP-005",name:"Karthik Menon"}
];

// Helper: working days in May, June, July 2025 (weekdays only, skip Sundays/Saturdays)
var sampleDays = [];
var months = [
  {y:2025,m:5,days:31},{y:2025,m:6,days:30},{y:2025,m:7,days:21}
];
months.forEach(function(mo) {
  for (var d = 1; d <= mo.days; d++) {
    var dt = new Date(mo.y, mo.m - 1, d);
    var dow = dt.getDay(); // 0=Sun,6=Sat
    if (dow !== 0 && dow !== 6) {
      var mm = String(mo.m).padStart(2,"0");
      var dd = String(d).padStart(2,"0");
      sampleDays.push(mo.y + "-" + mm + "-" + dd);
    }
  }
});

// Predefined patterns per employee to keep it realistic
var patterns = {
  "NAP-001": { absent:[], wfh:["2025-05-12","2025-05-26","2025-06-09","2025-06-23","2025-07-07","2025-07-14"], late:[], halfDay:[], leaveOn:[], checkInBase:"09:00", checkOutBase:"18:30" },
  "NAP-002": { absent:[], wfh:["2025-05-07","2025-05-21","2025-06-04","2025-06-18","2025-07-02","2025-07-09"], late:[], halfDay:[], leaveOn:[], checkInBase:"09:15", checkOutBase:"19:00" },
  "NAP-003": { absent:["2025-05-15","2025-06-12"], wfh:["2025-05-09","2025-06-06","2025-07-11"], late:["2025-05-20","2025-06-17"], halfDay:[], leaveOn:["2025-05-15","2025-06-12"], checkInBase:"09:30", checkOutBase:"18:00" },
  "NAP-004": { absent:["2025-05-22","2025-05-23","2025-05-26"], wfh:["2025-05-08","2025-06-05","2025-07-10"], late:["2025-05-14","2025-06-10","2025-07-03"], halfDay:["2025-06-20"], leaveOn:["2025-05-22","2025-05-23","2025-05-26"], checkInBase:"09:45", checkOutBase:"18:15" },
  "NAP-005": { absent:[], wfh:["2025-05-06","2025-05-27","2025-06-03","2025-06-24","2025-07-08"], late:["2025-06-02"], halfDay:[], leaveOn:[], checkInBase:"09:00", checkOutBase:"19:30" }
};

empIds.forEach(function(emp) {
  var pat = patterns[emp.id];
  sampleDays.forEach(function(dateStr) {
    var isAbsent   = pat.absent.indexOf(dateStr)  !== -1;
    var isWfh      = pat.wfh.indexOf(dateStr)     !== -1;
    var isLate     = pat.late.indexOf(dateStr)     !== -1;
    var isHalfDay  = pat.halfDay.indexOf(dateStr)  !== -1;
    var isLeaveOn  = pat.leaveOn.indexOf(dateStr)  !== -1;

    var status = "PRESENT";
    if (isAbsent || isLeaveOn) status = "ON_LEAVE";
    else if (isWfh)    status = "WFH";
    else if (isHalfDay) status = "HALF_DAY";
    else if (isLate)   status = "LATE";

    var checkIn  = "";
    var checkOut = "";
    var workHrs  = "";
    var method   = "WEB";
    var overtime = "";

    if (status !== "ON_LEAVE" && status !== "ABSENT") {
      var baseIn = pat.checkInBase;
      if (isLate) {
        // Late: arrive 10:15-10:45
        var lateMin = (dateStr.charCodeAt(9) % 3) * 15 + 15;
        baseIn = "10:" + String(lateMin).padStart(2,"0");
      }
      var baseOut = pat.checkOutBase;
      if (isHalfDay) {
        baseOut = "13:30";
      }
      if (isWfh) method = "MOBILE";

      checkIn  = dateStr + " " + baseIn + ":00";
      checkOut = dateStr + " " + baseOut + ":00";

      // Calculate rough work hours
      var inParts  = baseIn.split(":").map(Number);
      var outParts = baseOut.split(":").map(Number);
      var totalMins = (outParts[0] * 60 + outParts[1]) - (inParts[0] * 60 + inParts[1]) - 60; // minus 1hr lunch
      workHrs = (totalMins / 60).toFixed(1);
      if (parseFloat(workHrs) > 9) {
        overtime = (parseFloat(workHrs) - 9).toFixed(1);
      }
    }

    attendanceRows.push({
      empId:         emp.id,
      empName:       emp.name,
      date:          dateStr,
      checkInTime:   checkIn,
      checkOutTime:  checkOut,
      status:        status,
      workHours:     workHrs,
      checkInMethod: checkIn ? method : "",
      checkInIp:     checkIn ? "10.0.0." + (emp.id.replace("NAP-","")) : "",
      overtime:      overtime,
      isRegularized: "FALSE",
      notes:         isLeaveOn ? "On approved leave" : ""
    });
  });
});
addRows(w20, c20, attendanceRows);

// ============================================================
// SHEET 21: LEAVE BALANCES (Per employee per leave type per year)
// ============================================================
var w21 = addWs("21 Leave Balances", "065F46");
var c21 = [
  { k: "empId",       h: "Employee ID *",                                                           m: 1, w: 18 },
  { k: "empName",     h: "Employee Name (reference)",                                               m: 0, w: 26 },
  { k: "leaveCode",   h: "Leave Type Code *\n(EL/SL/CL/ML/PL/LOP/COMP/BL/FL — from Leave Types sheet)", m: 1, w: 42 },
  { k: "year",        h: "Year *\n(e.g. 2025)",                                                     m: 1, w: 16 },
  { k: "allocated",   h: "Allocated Days *\n(max days given for the year)",                         m: 1, w: 26 },
  { k: "used",        h: "Used Days\n(already taken — 0 if fresh start)",                           m: 0, w: 26 },
  { k: "pending",     h: "Pending Days\n(in pending leave requests — 0 if fresh start)",            m: 0, w: 30 },
  { k: "carriedOver", h: "Carried Over Days\n(from previous year — 0 if first year)",               m: 0, w: 30 }
];
headers(w21, "Leave Balances — Per Employee Per Leave Type Per Year (CRITICAL for Leave Widget)", c21);

var leaveBalRows = [];
var leavePolicies = [
  {code:"EL", max:18}, {code:"SL", max:12}, {code:"CL", max:12},
  {code:"ML", max:182}, {code:"PL", max:15}, {code:"COMP", max:10},
  {code:"BL", max:5}, {code:"FL", max:3}
];

// Pre-defined leave usage per employee to keep realistic
var usageData = {
  "NAP-001": {EL:0, SL:0, CL:1, ML:0, PL:0, COMP:0, BL:0, FL:1},
  "NAP-002": {EL:2, SL:0, CL:0, ML:0, PL:0, COMP:1, BL:0, FL:1},
  "NAP-003": {EL:0, SL:2, CL:0, ML:0, PL:0, COMP:0, BL:0, FL:0},
  "NAP-004": {EL:3, SL:0, CL:0, ML:0, PL:0, COMP:0, BL:0, FL:1},
  "NAP-005": {EL:1, SL:1, CL:1, ML:0, PL:0, COMP:2, BL:0, FL:0}
};
var carryData = {
  "NAP-001": {EL:5, SL:0, CL:0}, "NAP-002": {EL:8, SL:0, CL:0},
  "NAP-003": {EL:3, SL:0, CL:0}, "NAP-004": {EL:0, SL:0, CL:0},
  "NAP-005": {EL:6, SL:0, CL:0}
};

empIds.forEach(function(emp) {
  leavePolicies.forEach(function(lp) {
    var used      = (usageData[emp.id]  && usageData[emp.id][lp.code])  || 0;
    var carryOver = (carryData[emp.id]  && carryData[emp.id][lp.code])  || 0;
    leaveBalRows.push({
      empId:       emp.id,
      empName:     emp.name,
      leaveCode:   lp.code,
      year:        "2025",
      allocated:   String(lp.max),
      used:        String(used),
      pending:     "0",
      carriedOver: String(carryOver)
    });
  });
});
addRows(w21, c21, leaveBalRows);

// ============================================================
// SHEET 22: LEAVE REQUESTS (Actual Leave Applications)
// ============================================================
var w22 = addWs("22 Leave Requests", "166534");
var c22 = [
  { k: "empId",         h: "Employee ID *",                                                         m: 1, w: 18 },
  { k: "empName",       h: "Employee Name (reference)",                                             m: 0, w: 26 },
  { k: "leaveCode",     h: "Leave Type Code *\n(EL/SL/CL/ML/PL/LOP/COMP/BL/FL)",                  m: 1, w: 36 },
  { k: "startDate",     h: "Leave Start Date *\n(YYYY-MM-DD)",                                      m: 1, w: 24 },
  { k: "endDate",       h: "Leave End Date *\n(YYYY-MM-DD)",                                        m: 1, w: 24 },
  { k: "totalDays",     h: "Total Days *\n(e.g. 1 / 2.5 / 0.5 for half day)",                      m: 1, w: 26 },
  { k: "isHalfDay",     h: "Is Half Day?\n(TRUE/FALSE)",                                            m: 0, w: 20 },
  { k: "halfDaySess",   h: "Half Day Session\n(MORNING/AFTERNOON — only if half day)",              m: 0, w: 30 },
  { k: "isEmergency",   h: "Is Emergency Leave?\n(TRUE/FALSE)",                                     m: 0, w: 26 },
  { k: "reason",        h: "Reason *",                                                              m: 1, w: 45 },
  { k: "status",        h: "Status\n(PENDING/APPROVED/REJECTED/CANCELLED)",                        m: 0, w: 32 },
  { k: "appliedAt",     h: "Applied At\n(YYYY-MM-DD)",                                              m: 0, w: 22 },
  { k: "paidDays",      h: "Paid Days\n(auto calc — leave blank for system to fill)",               m: 0, w: 26 },
  { k: "unpaidDays",    h: "Unpaid/LOP Days\n(auto calc — leave blank for system to fill)",        m: 0, w: 28 }
];
headers(w22, "Leave Requests — Historical Leave Applications (CRITICAL for Leave History & LOP Calc)", c22);
addRows(w22, c22, [
  // NAP-003 (Tejesh) — Sick Leave
  {empId:"NAP-003",empName:"Tejesh Kumar Vemula",leaveCode:"SL",startDate:"2025-05-15",endDate:"2025-05-15",totalDays:"1",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Fever and viral infection — doctor advised rest for 1 day",status:"APPROVED",appliedAt:"2025-05-14",paidDays:"1",unpaidDays:"0"},
  {empId:"NAP-003",empName:"Tejesh Kumar Vemula",leaveCode:"SL",startDate:"2025-06-12",endDate:"2025-06-12",totalDays:"1",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Migraine and severe headache",status:"APPROVED",appliedAt:"2025-06-12",paidDays:"1",unpaidDays:"0"},
  // NAP-004 (Anusha) — 3 days Earned Leave
  {empId:"NAP-004",empName:"Anusha Pillai",leaveCode:"EL",startDate:"2025-05-22",endDate:"2025-05-26",totalDays:"3",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Family function — sister's wedding ceremony in Thiruvananthapuram",status:"APPROVED",appliedAt:"2025-05-10",paidDays:"3",unpaidDays:"0"},
  // NAP-004 — Half Day
  {empId:"NAP-004",empName:"Anusha Pillai",leaveCode:"CL",startDate:"2025-06-20",endDate:"2025-06-20",totalDays:"0.5",isHalfDay:"TRUE",halfDaySess:"AFTERNOON",isEmergency:"FALSE",reason:"Personal work — bank appointment",status:"APPROVED",appliedAt:"2025-06-19",paidDays:"0.5",unpaidDays:"0"},
  // NAP-002 — Earned Leave
  {empId:"NAP-002",empName:"Lokesh Reddy",leaveCode:"EL",startDate:"2025-05-05",endDate:"2025-05-06",totalDays:"2",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Vacation with family to Coorg",status:"APPROVED",appliedAt:"2025-04-28",paidDays:"2",unpaidDays:"0"},
  // NAP-005 — Various
  {empId:"NAP-005",empName:"Karthik Menon",leaveCode:"EL",startDate:"2025-06-02",endDate:"2025-06-02",totalDays:"1",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Child school admission day — need to be present",status:"APPROVED",appliedAt:"2025-05-28",paidDays:"1",unpaidDays:"0"},
  {empId:"NAP-005",empName:"Karthik Menon",leaveCode:"SL",startDate:"2025-07-03",endDate:"2025-07-03",totalDays:"1",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"TRUE",reason:"Sudden chest pain — hospital visit (emergency)",status:"APPROVED",appliedAt:"2025-07-03",paidDays:"1",unpaidDays:"0"},
  // NAP-001 — Casual Leave
  {empId:"NAP-001",empName:"Pradeep Chandra",leaveCode:"CL",startDate:"2025-06-27",endDate:"2025-06-27",totalDays:"1",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Personal appointment",status:"APPROVED",appliedAt:"2025-06-25",paidDays:"1",unpaidDays:"0"},
  // Pending request (future)
  {empId:"NAP-004",empName:"Anusha Pillai",leaveCode:"EL",startDate:"2025-08-04",endDate:"2025-08-08",totalDays:"5",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Planned vacation to Goa with family",status:"PENDING",appliedAt:"2025-07-18",paidDays:"",unpaidDays:""},
  {empId:"NAP-003",empName:"Tejesh Kumar Vemula",leaveCode:"CL",startDate:"2025-08-01",endDate:"2025-08-01",totalDays:"1",isHalfDay:"FALSE",halfDaySess:"",isEmergency:"FALSE",reason:"Government document work — Aadhaar update",status:"PENDING",appliedAt:"2025-07-20",paidDays:"",unpaidDays:""}
]);

// ============================================================
// SHEET 23: WORKDAY SUMMARIES (Daily hours summary per employee)
// ============================================================
var w23 = addWs("23 Workday Summaries", "134E4A");
var c23 = [
  { k: "empId",      h: "Employee ID *",                                                            m: 1, w: 18 },
  { k: "empName",    h: "Employee Name (reference)",                                                m: 0, w: 26 },
  { k: "date",       h: "Date *\n(YYYY-MM-DD)",                                                     m: 1, w: 22 },
  { k: "targetHrs",  h: "Target Hours *\n(standard shift hours e.g. 9.0)",                         m: 1, w: 28 },
  { k: "actualHrs",  h: "Actual Work Hours *\n(e.g. 8.5 — decimal)",                               m: 1, w: 28 },
  { k: "overtime",   h: "Overtime Hours\n(e.g. 1.5 — 0 if none)",                                  m: 0, w: 24 },
  { k: "shortfall",  h: "Shortfall Hours\n(e.g. 0.5 if worked less than target — 0 if met)",       m: 0, w: 30 }
];
headers(w23, "Workday Summaries — Daily Hours Tracking (feeds Attendance Analytics)", c23);

// Generate summary rows matching the attendance records above
var wdSummaryRows = [];
var targetHours = 9.0;

empIds.forEach(function(emp) {
  var pat = patterns[emp.id];
  // Take a sample of 15 days for brevity (full list mirrors attendance sheet)
  var sampleSlice = sampleDays.slice(0, 15);
  sampleSlice.forEach(function(dateStr) {
    var isAbsent  = pat.absent.indexOf(dateStr)  !== -1;
    var isLeaveOn = pat.leaveOn.indexOf(dateStr) !== -1;
    var isHalfDay = pat.halfDay.indexOf(dateStr) !== -1;
    var isLate    = pat.late.indexOf(dateStr)    !== -1;

    if (isAbsent || isLeaveOn) return; // no workday summary for absent/leave days

    var baseIn  = pat.checkInBase;
    var baseOut = pat.checkOutBase;
    if (isLate) baseIn = "10:15";
    if (isHalfDay) baseOut = "13:30";

    var inParts  = baseIn.split(":").map(Number);
    var outParts = baseOut.split(":").map(Number);
    var totalMins = (outParts[0] * 60 + outParts[1]) - (inParts[0] * 60 + inParts[1]) - 60;
    var actual    = parseFloat((totalMins / 60).toFixed(1));
    var ot        = actual > targetHours ? parseFloat((actual - targetHours).toFixed(1)) : 0;
    var shortfall = actual < targetHours ? parseFloat((targetHours - actual).toFixed(1)) : 0;

    wdSummaryRows.push({
      empId:     emp.id,
      empName:   emp.name,
      date:      dateStr,
      targetHrs: String(targetHours),
      actualHrs: String(actual),
      overtime:  String(ot),
      shortfall: String(shortfall)
    });
  });
});
addRows(w23, c23, wdSummaryRows);

// ============================================================
// SAVE
// ============================================================
var out = "D:\\naprocs-ems\\Naprocs_EMS_Data_Entry_Workbook_v2.xlsx";
workbook.xlsx.writeFile(out).then(function () {
  console.log("");
  console.log("SUCCESS: " + out);
  console.log("23 sheets generated:");
  [
    "01 Departments","02 Designations","03 Employees Master (55 cols)",
    "04 Salary Structures","05 Leave Types","06 Assets Inventory",
    "07 Company Holidays","08 Skills Library","09 Employee Skills Map",
    "10 Jobs (Recruitment)","11 Candidates","12 Courses & Learning",
    "13 Projects","14 Review Cycles","15 Surveys",
    "16 Knowledge Base","17 Grievances","18 Compliance","19 Enum Reference",
    "20 Attendance Records (LOGIN/LOGOUT — CRITICAL)",
    "21 Leave Balances (CRITICAL for leave widget)",
    "22 Leave Requests (CRITICAL for leave history)",
    "23 Workday Summaries (feeds attendance analytics)"
  ].forEach(function(s,i){ console.log("    " + (i+1) + ". " + s); });
  console.log("");
  console.log("NOTE: Sheets 20-23 are the NEW additions for Attendance & Leave data.");
  console.log("");
}).catch(function (e) { console.error("ERROR: " + e.message); process.exit(1); });
