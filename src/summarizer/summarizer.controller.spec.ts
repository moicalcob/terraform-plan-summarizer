import { Test, TestingModule } from '@nestjs/testing';
import { SummarizerController } from './summarizer.controller';
import { SummarizerService } from './summarizer.service';
import { BadRequestException } from '@nestjs/common';

describe('SummarizerController', () => {
  let controller: SummarizerController;
  let service: SummarizerService;

  const mockSummarizerService = {
    summarize: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummarizerController],
      providers: [
        {
          provide: SummarizerService,
          useValue: mockSummarizerService,
        },
      ],
    }).compile();

    controller = module.get<SummarizerController>(SummarizerController);
    service = module.get<SummarizerService>(SummarizerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('summarizePlan', () => {
    it('should successfully summarize a plan file', async () => {
      const mockFile = {
        buffer: Buffer.from('{"some": "json"}'),
        originalname: 'plan.json',
      } as Express.Multer.File;

      const expectedSummary = 'Summary of changes';
      mockSummarizerService.summarize.mockResolvedValue(expectedSummary);

      const result = await controller.summarizePlan([mockFile]);

      expect(result).toEqual({ summary: expectedSummary });
      expect(mockSummarizerService.summarize).toHaveBeenCalledWith([mockFile]);
    });

    it('should throw BadRequestException when service throws an error', async () => {
      const mockFile = {
        buffer: Buffer.from('{"some": "json"}'),
        originalname: 'plan.json',
      } as Express.Multer.File;

      const errorMessage = 'Failed to process file';
      mockSummarizerService.summarize.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.summarizePlan([mockFile])).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.summarizePlan([mockFile])).rejects.toThrow(
        errorMessage,
      );
    });

    it('should throw BadRequestException with generic message for unknown errors', async () => {
      const mockFile = {
        buffer: Buffer.from('{"some": "json"}'),
        originalname: 'plan.json',
      } as Express.Multer.File;

      mockSummarizerService.summarize.mockRejectedValue('Unknown error');

      await expect(controller.summarizePlan([mockFile])).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.summarizePlan([mockFile])).rejects.toThrow(
        'Failed to summarize plan',
      );
    });
  });
});
