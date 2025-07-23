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
        temperature: 0.3, 
        max_tokens: 4000, 
      });

      console.log('✅ OpenAI API call successful');
      console.log('Usage:', completion.usage);
      
      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response content from OpenAI');
      }

      console.log('Raw response length:', response.length);
      
      
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
  "components": {
    // Optional: include shared components if needed
    // "Layout": "({ children }) => { return (/* JSX layout wrapper */); }"
  },
  "styles": "/* Global CSS styles */"
}

CRITICAL REQUIREMENTS:
1. Generate functional React JSX components using modern syntax
2. Use Tailwind CSS for styling with modern design patterns
3. MANDATORY: Add data-edit-id="unique-id" to ALL text content elements - this is required for editing functionality
4. Make it responsive and visually appealing
5. Do NOT include any imports or 'export default' - write pure JSX functions
6. Each page should be a function returning JSX that can be rendered directly

EDITING REQUIREMENTS (CRITICAL FOR FUNCTIONALITY):
7. Every heading (h1, h2, h3) must have data-edit-id="heading-name"
8. Every paragraph and text content must have data-edit-id="text-name" 
9. Every button text must have data-edit-id="button-name"
10. Every brand/logo text must have data-edit-id="brand-name"
11. Examples: <h1 data-edit-id="hero-title">Welcome</h1>, <p data-edit-id="hero-description">Text here</p>
12. Without data-edit-id attributes, the editing feature will not work - this is mandatory

NAVIGATION REQUIREMENTS:
13. Include a professional navbar at the top of EVERY page with navigation links
14. Add a footer section at the bottom of EVERY page
15. On the home page, include prominent navigation buttons/cards to access other pages
16. Use consistent navigation structure across all pages
17. Make navigation visually appealing with hover effects and modern styling
18. CRITICAL: Use data-nav-page="pagename" instead of href for navigation links
19. Navigation should be buttons or clickable divs with data-nav-page attributes
20. NEVER use <a href="/page"> - always use data-nav-page="page" for internal navigation

NAVIGATION EXAMPLES:
- Navbar: <button data-nav-page="about" className="nav-link">About</button>
- Footer: <div data-nav-page="contact" className="footer-link cursor-pointer">Contact</div>
- Home buttons: <button data-nav-page="services" className="cta-button">Our Services</button>

STRUCTURE REQUIREMENTS (apply to every site):
21. OPTIONAL: You may include shared components (like Layout) in the "components" section if it helps create cleaner, more professional pages.
22. Structure each page with:
    • Header: flex container with brand name left, nav links right, proper padding
    • Main content: FULL-HEIGHT sections for ALL pages (min-h-screen with flex centering), not just home page
    • Footer: simple copyright notice
23. If you don't provide shared components, make each page completely self-contained with inline structure.

LAYOUT & SPACING REQUIREMENTS:
-24. ALL main content sections must use min-h-screen or min-h-[80vh] to feel full and immersive (home, about, services, contact, etc.)
+24. CRITICAL: ALL pages must use min-h-screen for main content - this is mandatory, not optional. Each page should fill the entire viewport height.
25. Use generous padding and margins: py-16, py-20, px-8, space-y-8, space-y-12
26. Text should be large and impactful: text-4xl, text-5xl, text-6xl for headings
27. Center content vertically and horizontally using flex utilities: flex items-center justify-center
28. Make ALL pages feel spacious, not cramped - every page should fill the viewport height with proper content centering

CONTENT REQUIREMENTS:
29. Home page must include: large hero heading, compelling subtitle (2-3 lines), multiple CTA buttons, feature highlights or benefits section
30. About page must include: company story, mission statement, team info, values or achievements
31. Services page must include: service cards/grid, detailed descriptions, pricing or features, testimonials
32. Contact page must include: contact form, address/location, phone/email, business hours, map or directions
33. Each page should have substantial content - avoid single sentences or minimal text
34. Include multiple sections per page: hero + features + testimonials + CTA sections

VISUAL DESIGN REQUIREMENTS:
35. Use professional, muted color schemes: subtle gradients (bg-gradient-to-r from-gray-50 to-gray-100), neutral tones (slate, gray, zinc, stone), minimal accent colors (blue-600, indigo-600)
36. Add visual interest with: rounded corners (rounded-lg, rounded-xl), shadows (shadow-lg, shadow-xl), subtle borders
37. Hero sections should have subtle background gradients or light gray tones, avoid bright colors
38. Buttons should be elegant with: px-8 py-4, rounded-lg, subtle shadows, professional colors (gray-900, slate-700, blue-600)
39. Include visual elements: subtle background patterns, colored sections, card layouts with shadows
40. Use refined typography: font-medium, font-semibold, text-gray-700 for headings, text-gray-600 for descriptions
41. Add subtle hover effects: hover:shadow-lg, hover:bg-gray-50, transition-all duration-200 (avoid dramatic scaling)

DETAILED STYLING REQUIREMENTS (apply extensive Tailwind classes):
42. Headers: bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center
43. Brand/Logo: text-2xl font-bold text-gray-900 tracking-tight
44. Navigation links: text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium
45. Hero sections: bg-gradient-to-br from-gray-50 to-white py-20 px-8 text-center space-y-8
46. Main headings: text-5xl font-bold text-gray-900 leading-tight tracking-tight
47. Subheadings: text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed
48. CTA buttons: bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl font-semibold transition-all
49. Feature cards: bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow
50. Card headings: text-xl font-semibold text-gray-900 mb-3
51. Card descriptions: text-gray-600 leading-relaxed
52. Sections: py-16 px-8 space-y-12
53. Footers: bg-gray-50 border-t border-gray-200 py-8 text-center text-gray-600

STYLE NOTE: Use Tailwind utility classes for spacing/typography; keep color palette neutral/professional.

54. Ensure overall design remains clean, modern, and responsive.
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