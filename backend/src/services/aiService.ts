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
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent output
        max_tokens: 4000, // Increased for more comprehensive responses
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
        
        // Try to clean the JSON response
        try {
          const cleanedResponse = this.cleanJsonResponse(response);
          generatedCode = JSON.parse(cleanedResponse);
          console.log('✅ Successfully parsed cleaned response');
        } catch (cleanError) {
          console.error('Failed to clean and parse JSON:', cleanError);
          throw new Error('Invalid JSON response from OpenAI');
        }
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
      throw error;
    }
  }

  private static cleanJsonResponse(response: string): string {
    // Remove any text before the first { and after the last }
    const startIndex = response.indexOf('{');
    const endIndex = response.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('No valid JSON object found in response');
    }
    
    let cleaned = response.substring(startIndex, endIndex + 1);
    
    // Fix common JSON issues in JSX strings
    cleaned = cleaned
      // Replace unescaped backslashes followed by characters (but not already escaped ones)
      .replace(/\\(?!["\\/bfnrt])/g, '\\\\')
      // Replace actual newlines with \n
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Fix unescaped quotes in JSX strings (basic attempt)
      .replace(/([^\\])"/g, '$1\\"');
    
    return cleaned;
  }

  private static getSystemPrompt(): string {
    return `You are an expert web developer. Create modern, professional websites using React JSX and Tailwind CSS.

CRITICAL JSON FORMATTING:
- Write ALL JSX code on a SINGLE line without line breaks
- Use spaces instead of newlines for readability
- Properly escape quotes and backslashes
- Return ONLY valid JSON that can be parsed

Key requirements:
- Mobile-first responsive design
- Add data-edit-id="unique-id" to ALL editable elements
- Generate realistic content matching the purpose
- Use Unsplash images: https://images.unsplash.com/photo-[id]?w=800&h=600&fit=crop`;
  }

  private static createWebsitePrompt(description: string): string {
    return `Generate a professional website for: "${description}"

IMPORTANT: Write ALL JSX code as single-line strings without line breaks to ensure valid JSON.

JSON format:
{
  "pages": {
    "index": "() => { return (<div>ALL JSX IN ONE LINE</div>); }",
    "about": "() => { return (<div>ALL JSX IN ONE LINE</div>); }",
    "contact": "() => { return (<div>ALL JSX IN ONE LINE</div>); }"
  },
  "styles": "/* CSS styles */",
  "metadata": {"title": "Site Title", "description": "Site description", "theme": "blue"}
}

Requirements:
- Tailwind CSS only, responsive design
- data-edit-id on all headings, text, buttons
- Realistic content with navigation
- Modern design with hover effects
- Single-line JSX to avoid JSON parsing errors

Example single-line JSX:
"() => { return (<div className='min-h-screen'><header className='bg-blue-600 text-white p-4'><h1 data-edit-id='title'>Title</h1></header><main className='container mx-auto p-8'><section className='text-center'><h2 data-edit-id='hero'>Hero Text</h2><button data-edit-id='cta' className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600'>Click Me</button></section></main></div>); }"`;
  }

  static async editElement(elementId: string, newContent: string, currentPageCode: string): Promise<string> {
    const prompt = `Update element with data-edit-id="${elementId}" to: "${newContent}"

Current code:
${currentPageCode}

Return only the updated JSX function.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Update React JSX element. Return only code, no explanation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response content from OpenAI');
      }

      return response.trim();
    } catch (error) {
      console.error('❌ Element edit error:', error);
      throw error;
    }
  }
}