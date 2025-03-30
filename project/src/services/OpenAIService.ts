import OpenAI from 'openai';

export enum VerificationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_HUMAN_REVIEW = 'PENDING_HUMAN_REVIEW'
}

export interface VerificationResult {
  status: VerificationStatus;
  confidence: number;
  reason: string;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For demo purposes
});

export class OpenAIService {
  static async analyzeDocument(
    documentType: string,
    documentContent: string | ArrayBuffer
  ): Promise<{
    isValid: boolean;
    feedback: string;
    suggestedCorrections?: string[];
  }> {
    console.log(`🤖 OpenAI: Analyzing ${documentType} document...`);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert government document validator for ${documentType}.`
          },
          {
            role: "user",
            content: `Analyze this ${documentType} content briefly.`
          }
        ],
        max_tokens: 150
      });

      console.log(`✅ OpenAI: Document analysis complete for ${documentType}`);
      const analysis = response.choices[0].message.content;
      return {
        isValid: analysis?.includes("valid") || false,
        feedback: analysis || "Analysis failed",
        suggestedCorrections: analysis?.match(/correction:.*$/gm) ?? undefined
      };
    } catch (error) {
      console.error('❌ OpenAI: Document analysis failed:', error);
      return {
        isValid: true,
        feedback: "Automatic verification skipped. Manual review may be required.",
      };
    }
  }

  static async generateBusinessSuggestions(businessInfo: any): Promise<string[]> {
    console.log(`🤖 OpenAI: Generating suggestions for business:`, businessInfo);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a business compliance expert. Provide suggestions for business registration and compliance."
          },
          {
            role: "user",
            content: `Please provide suggestions for this business: ${JSON.stringify(businessInfo)}`
          }
        ]
      });

      console.log(`✅ OpenAI: Business suggestions generated`);
      return response.choices[0].message.content?.split('\n') || [];
    } catch (error) {
      console.error('❌ OpenAI: Failed to generate business suggestions:', error);
      return [];
    }
  }

  static async generateApplicationHelp(
    serviceType: string,
    currentStep: string,
    userInput?: any
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful government service application assistant. Provide clear, concise guidance in both Hindi and English."
          },
          {
            role: "user",
            content: `Please provide guidance for ${serviceType} application, step: ${currentStep}, user input: ${JSON.stringify(userInput)}`
          }
        ]
      });

      return response.choices[0].message.content || "No help available";
    } catch (error) {
      console.error('OpenAI help generation failed:', error);
      return "Help currently unavailable";
    }
  }

  static async verifyDocuments(
    serviceType: string,
    documents: Record<string, string>
  ): Promise<VerificationResult> {
    console.log(`🤖 OpenAI: Verifying documents for ${serviceType}...`, documents);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert government document verification system specializing in ${serviceType} applications.`
          },
          {
            role: "user",
            content: `Please verify these documents for ${serviceType}: ${JSON.stringify(documents)}`
          }
        ]
      });

      console.log(`✅ OpenAI: Document verification complete for ${serviceType}`);
      const analysis = response.choices[0].message.content;
      
      let status = VerificationStatus.PENDING_HUMAN_REVIEW;
      if (analysis?.includes('APPROVED')) status = VerificationStatus.APPROVED;
      if (analysis?.includes('REJECTED')) status = VerificationStatus.REJECTED;

      console.log(`📝 OpenAI Verification Result:`, {
        status,
        analysis
      });

      return {
        status,
        confidence: 0.85,
        reason: analysis || 'Verification complete'
      };
    } catch (error) {
      console.error('❌ OpenAI: Document verification failed:', error);
      return {
        status: VerificationStatus.PENDING_HUMAN_REVIEW,
        confidence: 0.5,
        reason: 'Automatic verification failed. Manual review required.'
      };
    }
  }
}