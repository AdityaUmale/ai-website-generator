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
- Use Unsplash images: https://images.unsplash.com/photo-[id]?w=800&h=600&fit=crop
- Include proper navigation structure with navbar and footer
- Create professional, modern UI with excellent UX
- Ensure consistent navigation across all pages
- CRITICAL: Use data-nav-page="pagename" instead of href for navigation links`;
  }

  private static createWebsitePrompt(description: string): string {
    return `
Generate a complete Next.js website based on this description: "${description}"

Determine the appropriate pages from the description (e.g., if user requests Home, About, Services, use keys like "home", "about", "services"). Always include a home page as "index".

Return ONLY a valid JSON object with this structure:
{
  "pages": {
    "index": "() => { return (/* JSX for home page */); }",
    "page1": "() => { return (/* JSX for page1 */); }",
    // Add more pages as needed based on description
  },
  "styles": "/* Global CSS styles */"
}

CRITICAL REQUIREMENTS:
1. Generate functional React JSX components using modern syntax
2. Use Tailwind CSS for styling with modern design patterns
3. Add data-edit-id="unique-id" to all editable elements (headings, text, buttons)
4. Make it responsive and visually appealing
5. Do NOT include any imports or 'export default' - write pure JSX functions
6. Each page should be a function returning JSX that can be rendered directly

NAVIGATION REQUIREMENTS:
7. Include a professional navbar at the top of EVERY page with navigation links
8. Add a footer section at the bottom of EVERY page
9. On the home page, include prominent navigation buttons/cards to access other pages
10. Use consistent navigation structure across all pages
11. Make navigation visually appealing with hover effects and modern styling
12. CRITICAL: Use data-nav-page="pagename" instead of href for navigation links
13. Navigation should be buttons or clickable divs with data-nav-page attributes
14. NEVER use <a href="/page"> - always use data-nav-page="page" for internal navigation

NAVIGATION EXAMPLES:
- Navbar: <button data-nav-page="about" className="nav-link">About</button>
- Footer: <div data-nav-page="contact" className="footer-link cursor-pointer">Contact</div>
- Home buttons: <button data-nav-page="services" className="cta-button">Our Services</button>

UI/UX REQUIREMENTS:
15. Use modern color schemes and typography
16. Include hero sections, call-to-action buttons, and engaging content
17. Add appropriate icons and visual elements
18. Ensure excellent mobile responsiveness
19. Create professional layouts with proper spacing and visual hierarchy
20. Use gradients, shadows, and modern CSS effects for visual appeal
`;
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