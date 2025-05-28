import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SummarizerModule } from './summarizer/summarizer.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        GEMINI_API_KEY: Joi.string().required(),
      }),
    }),
    SummarizerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
