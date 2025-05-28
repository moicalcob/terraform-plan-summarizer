import { Module } from '@nestjs/common';
import { SummarizerController } from './summarizer.controller';
import { SummarizerService } from './summarizer.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [SummarizerController],
  providers: [SummarizerService],
})
export class SummarizerModule {}
