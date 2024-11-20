import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractDomainFromUrl, sanitizeUrl } from './urlUtils';

interface ProductInfo {
  item: string;
  price?: number;
  imageUrl?: string;
  brand?: string;
  brandLogoUrl?: string;
}

export async function extractProductInfo(url: string): Promise<ProductInfo> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Invalid URL format');
  }

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    // Enhanced image extraction with priority order
    const imageSelectors = [
      // OpenGraph and meta tags (highest priority)
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image"]',
      'meta[property="product:image"]',
      'meta[name="twitter:image"]',
      
      // Structured data
      'script[type="application/ld+json"]',
      
      // Common product image selectors
      '[data-testid="product-image"]',
      '#product-image',
      '.product-image',
      'img[id*="product"][src*="large"]',
      'img[id*="product"][src*="zoom"]',
      'img[id*="product"]',
      'img[class*="product"]',
      
      // Gallery and main image selectors
      '.gallery-image-main',
      '.main-image',
      'img[id*="main"]',
      'img[class*="main"]',
      
      // Fallback to any large image
      'img[src*="large"]',
      'img[src*="zoom"]',
      'img[width="500"]',
      'img[width="600"]',
      'img[width="800"]'
    ];

    let imageUrl;

    // First try structured data
    const jsonLdScripts = $('script[type="application/ld+json"]').toArray();
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse($(script).html() || '');
        if (data['@type'] === 'Product' && data.image) {
          imageUrl = Array.isArray(data.image) ? data.image[0] : data.image;
          break;
        }
      } catch (e) {
        console.warn('Failed to parse JSON-LD:', e);
      }
    }

    // If no image found in structured data, try selectors
    if (!imageUrl) {
      for (const selector of imageSelectors) {
        if (selector === 'script[type="application/ld+json"]') continue;
        
        const element = $(selector);
        const src = element.attr('content') || element.attr('src');
        
        if (src && !src.includes('placeholder') && !src.includes('logo')) {
          // Check if it's a data URL
          if (src.startsWith('data:')) continue;
          
          // Basic size check from URL
          if (src.match(/\d+x\d+/) && !src.match(/[5-9]\d\d+x[5-9]\d\d+/)) continue;
          
          imageUrl = src;
          break;
        }
      }
    }

    // Enhanced title extraction
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[property="product:name"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('[data-testid="product-title"]').text().trim() ||
      $('h1').first().text().trim() ||
      'Untitled Product';

    // Enhanced price extraction
    const priceSelectors = [
      'meta[property="product:price:amount"]',
      '[data-testid="price"]',
      '.price',
      '[class*="price"]',
      '[itemprop="price"]'
    ];

    let price;
    for (const selector of priceSelectors) {
      const element = $(selector);
      const priceText = element.attr('content') || element.text().trim();
      if (priceText) {
        const parsedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsedPrice)) {
          price = parsedPrice;
          break;
        }
      }
    }

    // Enhanced brand extraction
    const brand = 
      $('meta[property="product:brand"]').attr('content') ||
      $('meta[property="og:site_name"]').attr('content') ||
      $('[data-testid="brand"]').text().trim() ||
      $('.brand').text().trim() ||
      extractDomainFromUrl(url);

    // Get brand logo from Clearbit
    const domain = extractDomainFromUrl(url);
    const brandLogoUrl = `https://logo.clearbit.com/${domain}`;

    // Sanitize and validate image URL
    let sanitizedImageUrl;
    if (imageUrl) {
      try {
        sanitizedImageUrl = sanitizeUrl(imageUrl, url);
        // Test if the image URL is accessible
        await axios.head(sanitizedImageUrl);
      } catch (error) {
        console.error('Failed to validate image URL:', error);
        sanitizedImageUrl = undefined;
      }
    }
    
    return {
      item: title,
      price,
      imageUrl: sanitizedImageUrl,
      brand,
      brandLogoUrl
    };
  } catch (error) {
    console.error('Failed to extract product info:', error);
    throw new Error('Failed to extract product information');
  }
}