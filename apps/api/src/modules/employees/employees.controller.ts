import { Controller, Post, Body, Get, Query, Param, Patch } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { OnboardingDraftStepDto } from "./dto/onboarding-step.dto";
import { PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { Employee } from "@naprocs/database";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post("onboarding/draft/step")
  async saveOnboardingStep(@Body() body: OnboardingDraftStepDto) {
    return this.employeesService.saveOnboardingStep(body.draftId || "", body.stepNumber, body.payload);
  }

  @Post("onboarding/draft/complete")
  async completeOnboarding(@Body() body: { draftId: string }): Promise<Employee> {
    return this.employeesService.completeOnboarding(body.draftId);
  }

  @Post()
  createEmployee(@Body() dto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.createEmployee(dto);
  }

  @Get()
  getEmployees(@Query() params: PaginationParams): Promise<PaginatedResult<Employee>> {
    return this.employeesService.getEmployees(params);
  }

  @Get(":id")
  getEmployeeById(@Param("id") id: string): Promise<Employee> {
    return this.employeesService.getEmployeeById(id);
  }

  @Patch(":id")
  updateEmployee(@Param("id") id: string, @Body() dto: UpdateEmployeeDto): Promise<Employee> {
    return this.employeesService.updateEmployee(id, dto);
  }
}

