"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var db = new client_1.PrismaClient();
function test() {
    return __awaiter(this, void 0, void 0, function () {
        var data_1, DEPT_MAP, deptCode, prefix, latestEmployee, nextNumber, parts, lastNumber, generatedEmployeeId_1, dept, _a, departmentId_1, result, e_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, 7, 9]);
                    data_1 = {
                        firstName: 'Test',
                        lastName: 'User',
                        email: 'test' + Date.now() + '@naprocs.in',
                        phone: '1234567890',
                        department: 'Engineering',
                        employmentType: 'Full-time'
                    };
                    DEPT_MAP = {
                        "Engineering": "TR",
                        "Product": "PR",
                        "Design": "DS",
                        "Sales": "SL",
                        "HR": "HR"
                    };
                    deptCode = DEPT_MAP[data_1.department] || "XX";
                    prefix = "NAP/".concat(deptCode, "/");
                    return [4 /*yield*/, db.employee.findFirst({
                            where: { employeeId: { startsWith: prefix } },
                            orderBy: { employeeId: 'desc' }
                        })];
                case 1:
                    latestEmployee = _b.sent();
                    nextNumber = 1;
                    if (latestEmployee) {
                        parts = latestEmployee.employeeId.split('/');
                        if (parts.length === 3) {
                            lastNumber = parseInt(parts[2], 10);
                            if (!isNaN(lastNumber))
                                nextNumber = lastNumber + 1;
                        }
                    }
                    generatedEmployeeId_1 = "".concat(prefix).concat(nextNumber.toString().padStart(3, '0'));
                    console.log("Generated ID:", generatedEmployeeId_1);
                    if (!data_1.department) return [3 /*break*/, 3];
                    return [4 /*yield*/, db.department.findUnique({ where: { name: data_1.department } })];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = null;
                    _b.label = 4;
                case 4:
                    dept = _a;
                    departmentId_1 = (dept === null || dept === void 0 ? void 0 : dept.id) || null;
                    return [4 /*yield*/, db.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var employee, session;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.employee.create({
                                            data: {
                                                employeeId: generatedEmployeeId_1,
                                                firstName: data_1.firstName,
                                                lastName: data_1.lastName,
                                                officialEmail: data_1.email,
                                                alternatePhone: data_1.phone,
                                                departmentId: departmentId_1,
                                                status: 'ONBOARDING',
                                                employeeType: 'FULL_TIME',
                                            }
                                        })];
                                    case 1:
                                        employee = _a.sent();
                                        console.log("Created employee:", employee.id);
                                        return [4 /*yield*/, tx.user.create({
                                                data: {
                                                    email: data_1.email,
                                                    passwordHash: 'dummy',
                                                    employeeId: employee.id,
                                                    role: 'EMPLOYEE',
                                                    status: 'ACTIVE'
                                                }
                                            })];
                                    case 2:
                                        _a.sent();
                                        console.log("Created user");
                                        return [4 /*yield*/, tx.onboardingSession.create({
                                                data: {
                                                    employeeId: employee.id,
                                                    stage: 'OFFER_ACCEPTED'
                                                }
                                            })];
                                    case 3:
                                        session = _a.sent();
                                        console.log("Created session:", session.id);
                                        return [4 /*yield*/, tx.onboardingTask.createMany({
                                                data: [
                                                    { sessionId: session.id, title: 'Verify I-9', assignedTo: 'HR' }
                                                ]
                                            })];
                                    case 4:
                                        _a.sent();
                                        console.log("Created tasks");
                                        return [2 /*return*/, session];
                                }
                            });
                        }); })];
                case 5:
                    result = _b.sent();
                    console.log("SUCCESS!", result);
                    return [3 /*break*/, 9];
                case 6:
                    e_1 = _b.sent();
                    console.error("PRISMA ERROR:", e_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, db.$disconnect()];
                case 8:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
test();
