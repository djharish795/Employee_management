import { Controller, Post, Get, Body, Query, UseGuards, BadRequestException, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { DocumentsService } from "./documents.service";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("documents")
@UseGuards(JwtAuthGuard, RbacGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @RequirePermissions(RbacPermissions.DOCUMENTS_UPLOAD)
  @Post("upload-url")
  async getUploadUrl(@Body() body: { fileName: string; contentType: string }, @CurrentUser() user: any) {
    if (!body.fileName || !body.contentType) {
      throw new BadRequestException("fileName and contentType are required");
    }
    const result = await this.documentsService.generateUploadUrl(body.fileName, body.contentType, user);
    return {
      message: "Upload URL generated successfully",
      data: result,
    };
  }

  @RequirePermissions(RbacPermissions.DOCUMENTS_READ)
  @Get("view-url")
  async getDownloadUrl(@Query("objectKey") objectKey: string, @CurrentUser() user: any) {
    if (!objectKey) {
      throw new BadRequestException("objectKey query parameter is required");
    }
    const url = await this.documentsService.generateDownloadUrl(objectKey, user);
    return {
      message: "View URL generated successfully",
      data: { url },
    };
  }

  @RequirePermissions(RbacPermissions.DOCUMENTS_UPLOAD)
  @Post("upload")
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const result = await this.documentsService.uploadAndStripExif(file, user);
    return {
      message: "File uploaded successfully",
      data: result,
    };
  }
}
