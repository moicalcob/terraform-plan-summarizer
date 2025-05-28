import { Test, TestingModule } from '@nestjs/testing';
import { SummarizerService } from './summarizer.service';
import { ConfigService } from '@nestjs/config';

// Mock the entire @google/genai module
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: 'Mocked summary',
      }),
    },
    files: {
      upload: jest.fn().mockResolvedValue({
        name: 'test-file',
        uri: 'test-uri',
        mimeType: 'text/plain',
      }),
      get: jest.fn().mockResolvedValue({
        state: 'SUCCESS',
      }),
    },
  })),
  createPartFromUri: jest.fn(),
}));

describe('SummarizerService', () => {
  let service: SummarizerService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('fake-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummarizerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SummarizerService>(SummarizerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with API key from config', () => {
    expect(configService.get).toHaveBeenCalledWith('GEMINI_API_KEY');
  });
});
