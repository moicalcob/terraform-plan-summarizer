import {
  Controller,
  Post,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UploadedFiles,
} from '@nestjs/common';
import { SummarizerService } from './summarizer.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('summarize')
export class SummarizerController {
  constructor(private readonly summarizerService: SummarizerService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async summarizePlan(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 100000,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    try {
      const summary = await this.summarizerService.summarize(files);
      return { summary };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Failed to summarize plan');
    }
  }
}
