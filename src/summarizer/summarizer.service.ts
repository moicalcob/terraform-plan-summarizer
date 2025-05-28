import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPartFromUri, GoogleGenAI } from '@google/genai';

@Injectable()
export class SummarizerService {
  private ai;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async summarize(planFiles: Array<Express.Multer.File>): Promise<string> {
    let prompt = '';
    if (planFiles.length > 1) {
      prompt = await this.getSummaryForMultipleFiles();
    } else {
      prompt = await this.getSummaryForOneFile();
    }

    const uploadedFiles: Array<{ uri: string; mimeType: string }> =
      await Promise.all(planFiles.map((file) => this.uploadFile(file)));

    const parts = uploadedFiles.map((file) =>
      createPartFromUri(file.uri, file.mimeType),
    );

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: [prompt, ...parts],
    });
    return result.text;
  }

  private getSummaryForOneFile(): string {
    return `
  The following is a collection of potential dangers identified by analyzing a large Terraform plan in separate chunks.

  Please review this entire report and provide:
  1. A high-level summary of the overall risk profile of the Terraform plan.
  2. The top 3-5 most critical or impactful dangers identified.
  3. Any observable patterns of dangerous changes or interconnected risks across different resources, even if they were in separate chunks.
  4. A concise list of actionable recommendations or critical questions to ask before applying this plan.

  The result should be in markdown format and easy to read. It should be short and concise. I don't want to read a long report.
  Let's also try to share information about costs that will be affected by the changes.
    `;
  }

  private getSummaryForMultipleFiles(): string {
    return `
  The following is a collection of potential dangers identified by analyzing a large Terraform plan in separate chunks.

  Please review this entire report and provide:
  1. A high-level summary of the overall risk profile of the Terraform plan.
  2. The top 3-5 most critical or impactful dangers identified.
  3. Any observable patterns of dangerous changes or interconnected risks across different resources, even if they were in separate chunks.
  4. A concise list of actionable recommendations or critical questions to ask before applying this plan.

  The result should be in markdown format and easy to read. It should be short and concise. I don't want to read a long report.
  Let's also try to share information about costs that will be affected by the changes.

  Take into account that each file is a different project, but they share the same codebase so changes should be identical. Please let me know if there is any project that has a change
  that could be dangerous and different from the other projects.
    `;
  }

  private async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ uri: string; mimeType: string }> {
    const uploadedFile = await this.ai.files.upload({
      file: file.path,
      config: { mimeType: 'text/plain' },
    });

    // Wait for the file to be processed.
    let getFile = await this.ai.files.get({ name: uploadedFile.name });
    while (getFile.state === 'PROCESSING') {
      getFile = await this.ai.files.get({ name: uploadedFile.name });
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
    }
    if (getFile.state === 'FAILED') {
      throw new Error('File processing failed.');
    }
    return { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType };
  }
}
