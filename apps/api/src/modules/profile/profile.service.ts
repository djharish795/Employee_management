import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { encryptData, decryptData } from '../../common/utils/encrypt.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(employeeId: string): Promise<any> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        designation: true,
        reportingManager: true,
        user: true,
      },
    });

    if (!employee) throw new NotFoundException('Profile not found');

    const tlAssignment = await this.prisma.projectAssignment.findFirst({
      where: { employeeId: employee.id, projectRole: 'TL' },
    });

    if (employee.user) {
      (employee.user as any).isTeamLead = !!tlAssignment;
    }

    // Decrypt sensitive fields for viewing (since only the owner can read their own profile in this endpoint)
    return {
      ...employee,
      phone: employee.phone ? decryptData(employee.phone) : null,
      alternatePhone: employee.alternatePhone ? decryptData(employee.alternatePhone) : null,
      pan: employee.pan ? decryptData(employee.pan) : null,
      aadhaar: employee.aadhaar ? decryptData(employee.aadhaar) : null,
      bankAccountEnc: employee.bankAccountEnc ? decryptData(employee.bankAccountEnc) : null,
    };
  }

  async updateMyProfile(employeeId: string, dto: UpdateProfileDto): Promise<any> {
    const updateData: any = {};

    if (dto.personalEmail !== undefined) updateData.personalEmail = dto.personalEmail;
    if (dto.preferredName !== undefined) updateData.preferredName = dto.preferredName;
    if (dto.bloodGroup !== undefined) updateData.bloodGroup = dto.bloodGroup;
    if (dto.photoUrl !== undefined) updateData.photoUrl = dto.photoUrl;
    if (dto.emergencyContact !== undefined) updateData.emergencyContact = dto.emergencyContact;
    if (dto.currentAddress !== undefined) updateData.currentAddress = dto.currentAddress;
    if (dto.permanentAddress !== undefined) updateData.permanentAddress = dto.permanentAddress;

    // Encrypt sensitive fields
    if (dto.phone !== undefined) updateData.phone = dto.phone ? encryptData(dto.phone) : null;
    if (dto.alternatePhone !== undefined) updateData.alternatePhone = dto.alternatePhone ? encryptData(dto.alternatePhone) : null;

    const employee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
    });

    return employee;
  }

  async changePassword(employeeId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { employeeId },
    });

    if (!user) throw new NotFoundException('User account not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Password updated successfully' };
  }
}
