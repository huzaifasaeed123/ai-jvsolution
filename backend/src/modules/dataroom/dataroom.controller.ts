import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { DataroomService } from './dataroom.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('dataroom')
@Controller()
export class DataroomController {
  constructor(private readonly service: DataroomService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('opportunities/:opportunityId/dataroom')
  @ApiOperation({ summary: 'Data room tree + accessible documents (permission-filtered)' })
  getDataRoom(@Param('opportunityId') opportunityId: string, @CurrentUser() user?: AuthUser) {
    return this.service.getDataRoom(opportunityId, user);
  }

  @Post('opportunities/:opportunityId/dataroom/init')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create the standard data-room folder structure (owner)' })
  init(@CurrentUser() user: AuthUser, @Param('opportunityId') opportunityId: string) {
    return this.service.initDataRoom(user, opportunityId);
  }

  @Post('opportunities/:opportunityId/folders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a folder (owner)' })
  createFolder(
    @CurrentUser() user: AuthUser,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: CreateFolderDto,
  ) {
    return this.service.createFolder(user, opportunityId, dto);
  }

  @Post('opportunities/:opportunityId/documents')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document to a folder (owner)' })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: AuthUser,
    @Param('opportunityId') opportunityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.service.uploadDocument(user, opportunityId, dto.folderId, file, dto.minAccessLevel);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('documents/:documentId/download')
  @ApiOperation({ summary: 'Download a document (permission-checked + audited)' })
  async download(
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthUser,
  ): Promise<StreamableFile> {
    const { stream, fileName, mimeType } = await this.service.prepareDownload(
      user as AuthUser,
      documentId,
    );
    res.set({
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName.replace(/"/g, '')}"`,
    });
    return new StreamableFile(stream);
  }

  @Delete('documents/:documentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a document (owner)' })
  remove(@CurrentUser() user: AuthUser, @Param('documentId') documentId: string) {
    return this.service.deleteDocument(user, documentId);
  }
}
