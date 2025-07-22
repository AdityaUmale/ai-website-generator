import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  static async generateWebsite(description: string): Promise<any> {
    const prompt = this.createWebsitePrompt(description);
    
    try {
      console.log('🚀 Making OpenAI API call...');
      console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
      console.log('Description:', description);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using cheaper model
        messages: [
          {
            role: "system",
            content: "You are an expert web developer who generates clean, modern Next.js websites."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      console.log('✅ OpenAI API call successful');
      console.log('Usage:', completion.usage);

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response content from OpenAI');
      }

      console.log('Raw response length:', response.length);
      
      // Try to parse the JSON response
      let generatedCode;
      try {
        generatedCode = JSON.parse(response);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', response.substring(0, 500) + '...');
        throw new Error('Invalid JSON response from OpenAI');
      }

      console.log('✅ Successfully parsed response');
      return generatedCode;
      
    } catch (error) {
      console.error('❌ AI generation error details:', {
        name: error instanceof Error ? error.name : 'Unknown Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: (error as any).status,
        type: (error as any).type
      });
      
      throw error; // Re-throw to see the full error in the route handler
    }
  }

  private static createWebsitePrompt(description: string): string {
    return `
Generate a complete Next.js website based on this description: "${description}"

Return ONLY a valid JSON object with this exact structure:
{
  "pages": {
    "index": "<!-- Next.js page content for home -->",
    "about": "<!-- Next.js page content for about -->",
    "contact": "<!-- Next.js page content for contact -->"
  },
  "styles": "/* Global CSS styles */"
}

Requirements:
1. Generate functional React components using modern syntax
2. Use Tailwind CSS for styling
3. Add data-edit-id="unique-id" to all editable elements (headings, text, buttons)
4. Make it responsive and visually appealing
5. Include proper Next.js structure with export default
6. Don't include any markdown formatting, just clean HTML/JSX
7. Each page should be a complete Next.js page component

Focus on clean, professional design with good UX.
`;
  }
}