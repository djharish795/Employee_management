import { Controller, Post, Get, Body, Query, UseGuards, BadRequestException } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("documents")
// @UseGuards(JwtAuthGuard) // Commented out for dev if auth isn't fully wired yet, uncomment later
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @RequirePermissions(RbacPermissions.DOCUMENTS_UPLOAD)
  @Post("upload-url")
  async getUploadUrl(@Body() body: { fileName: string; contentType: string }) {
    if (!body.fileName || !body.contentType) {
      throw new BadRequestException("fileName and contentType are required");
    }
    const result = await this.documentsService.generateUploadUrl(body.fileName, body.contentType);
    return {
      message: "Upload URL generated successfully",
      data: result,
    };
  }

  @RequirePermissions(RbacPermissions.DOCUMENTS_READ)
  @Get("view-url")
  async getDownloadUrl(@Query("objectKey") objectKey: string) {
    if (!objectKey) {
      throw new BadRequestException("objectKey query parameter is required");
    }
    const url = await this.documentsService.generateDownloadUrl(objectKey);
    return {
      message: "View URL generated successfully",
      data: { url },
    };
  }
}
