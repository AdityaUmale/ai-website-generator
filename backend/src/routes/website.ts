import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { WebsiteDescription, GeneratedWebsite } from '../types/website';

const router = Router();

// Generate website from description
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { description }: WebsiteDescription = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    console.log('Generating website for:', description);

    // Generate website using AI
    const generatedCode = await AIService.generateWebsite(description);

    // Create website object
    const website: GeneratedWebsite = {
      id: uuidv4(),
      pages: generatedCode.pages,
      styles: generatedCode.styles,
      timestamp: new Date(),
    };

    // Save to storage
    storageService.saveWebsite(website);

    res.json({
      success: true,
      website: {
        id: website.id,
        pages: Object.keys(website.pages),
        timestamp: website.timestamp,
      },
    });
  } catch (error) {
  console.error('❌ Generation error:', error);
  res.status(500).json({ 
    error: 'Failed to generate website',
    details: error instanceof Error ? error.message : 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
  });
  }
});

// Get website by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const website = storageService.getWebsite(id);

  if (!website) {
    return res.status(404).json({ error: 'Website not found' });
  }

  // Apply any edits
  const edits = storageService.getEdits(id);
  
  res.json({
    success: true,
    website,
    edits,
  });
});

// Get specific page content
router.get('/:id/page/:pageName', (req: Request, res: Response) => {
  const { id, pageName } = req.params;
  const website = storageService.getWebsite(id);

  if (!website) {
    return res.status(404).json({ error: 'Website not found' });
  }

  const pageContent = website.pages[pageName];
  if (!pageContent) {
    return res.status(404).json({ error: 'Page not found' });
  }

  res.json({
    success: true,
    content: pageContent,
    styles: website.styles,
  });
});

// Edit element
router.put('/:id/edit', (req: Request, res: Response) => {
  const { id } = req.params;
  const { elementId, content, styles } = req.body;

  const website = storageService.getWebsite(id);
  if (!website) {
    return res.status(404).json({ error: 'Website not found' });
  }

  // Save the edit
  storageService.saveEdit({
    siteId: id,
    elementId,
    content,
    styles,
  });

  res.json({ success: true });
});

export { router as websiteRoutes };
