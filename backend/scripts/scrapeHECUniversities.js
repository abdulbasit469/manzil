const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const University = require('../models/University');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/manzil', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  startScraping();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Store all scraped universities (to avoid duplicates)
const scrapedUniversities = new Set();
let totalScraped = 0;
let totalCombinations = 0;
let currentCombination = 0;

async function startScraping() {
  console.log('🚀 Starting HEC University Scraping...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage'
    ],
    slowMo: 100 // Slow down by 100ms for better reliability
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to HEC recognized universities page
    console.log('📄 Navigating to HEC website...');
    console.log('⏳ This may take 30-60 seconds, please wait...\n');
    
    // Try multiple navigation strategies
    let navigationSuccess = false;
    const strategies = [
      { waitUntil: 'load', timeout: 120000 },
      { waitUntil: 'domcontentloaded', timeout: 120000 },
      { waitUntil: 'networkidle0', timeout: 90000 }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`   Trying strategy ${i + 1}/3: ${strategies[i].waitUntil}...`);
        await page.goto('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx', strategies[i]);
        navigationSuccess = true;
        console.log('   ✅ Page loaded successfully!\n');
        break;
      } catch (error) {
        console.log(`   ⚠️  Strategy ${i + 1} failed: ${error.message}`);
        if (i < strategies.length - 1) {
          console.log('   Retrying with different strategy...\n');
          await page.waitForTimeout(2000);
        }
      }
    }

    if (!navigationSuccess) {
      throw new Error('Failed to load page with all strategies. Please check your internet connection.');
    }

    // Wait for filters to load
    console.log('⏳ Waiting for page content to fully render...');
    await page.waitForTimeout(8000);

    // Get all filter options
    console.log('🔍 Extracting filter options...\n');
    const filters = await extractFilterOptions(page);
    
    console.log('📊 Filter Options Found:');
    console.log(`   Sector: ${filters.sectors.length} options`);
    console.log(`   Chartered By: ${filters.charteredBy.length} options`);
    console.log(`   Discipline: ${filters.disciplines.length} options`);
    console.log(`   Province: ${filters.provinces.length} options`);
    console.log(`   City: ${filters.cities.length} options\n`);

    // Calculate total combinations
    totalCombinations = filters.sectors.length * 
                       filters.charteredBy.length * 
                       filters.disciplines.length * 
                       filters.provinces.length * 
                       filters.cities.length;
    
    console.log(`📈 Total filter combinations: ${totalCombinations.toLocaleString()}\n`);
    console.log('⚠️  This will take a while. Starting scraping...\n');

    // Iterate through all combinations
    for (const sector of filters.sectors) {
      for (const charteredBy of filters.charteredBy) {
        for (const discipline of filters.disciplines) {
          for (const province of filters.provinces) {
            for (const city of filters.cities) {
              currentCombination++;
              
              const filterCombo = {
                sector,
                charteredBy,
                discipline,
                province,
                city
              };

              console.log(`\n[${currentCombination}/${totalCombinations}] Processing:`, {
                Sector: sector,
                CharteredBy: charteredBy,
                Discipline: discipline,
                Province: province,
                City: city
              });

              try {
                await applyFiltersAndScrape(page, filterCombo);
                
                // Progress update
                if (currentCombination % 10 === 0) {
                  console.log(`\n📊 Progress: ${currentCombination}/${totalCombinations} (${((currentCombination/totalCombinations)*100).toFixed(2)}%)`);
                  console.log(`✅ Total Universities Scraped: ${totalScraped}`);
                  console.log(`📝 Unique Universities: ${scrapedUniversities.size}\n`);
                }

                // Small delay to avoid overwhelming the server
                await page.waitForTimeout(500);
              } catch (error) {
                console.error(`❌ Error processing combination ${currentCombination}:`, error.message);
                // Continue with next combination
              }
            }
          }
        }
      }
    }

    console.log('\n\n✅ Scraping Complete!');
    console.log(`📊 Total Combinations Processed: ${currentCombination}`);
    console.log(`🎓 Total Universities Scraped: ${totalScraped}`);
    console.log(`📝 Unique Universities Found: ${scrapedUniversities.size}`);

  } catch (error) {
    console.error('❌ Scraping Error:', error);
  } finally {
    await browser.close();
    await mongoose.connection.close();
    console.log('\n👋 Browser closed. Database connection closed.');
    process.exit(0);
  }
}

/**
 * Extract all filter options from the page
 */
async function extractFilterOptions(page) {
  const filters = {
    sectors: [],
    charteredBy: [],
    disciplines: [],
    provinces: [],
    cities: []
  };

  try {
    // Extract Sector options
    const sectorOptions = await page.evaluate(() => {
      const select = document.querySelector('select[name*="Sector"], select[id*="Sector"]');
      if (!select) return [];
      return Array.from(select.options).map(opt => opt.text.trim()).filter(t => t && t !== 'Select All');
    });
    filters.sectors = sectorOptions.length > 0 ? sectorOptions : ['Select All'];

    // Extract Chartered By options
    const charteredByOptions = await page.evaluate(() => {
      const select = document.querySelector('select[name*="Chartered"], select[id*="Chartered"]');
      if (!select) return [];
      return Array.from(select.options).map(opt => opt.text.trim()).filter(t => t && t !== 'Select All');
    });
    filters.charteredBy = charteredByOptions.length > 0 ? charteredByOptions : ['Select All'];

    // Extract Discipline options
    const disciplineOptions = await page.evaluate(() => {
      const select = document.querySelector('select[name*="Discipline"], select[id*="Discipline"]');
      if (!select) return [];
      return Array.from(select.options).map(opt => opt.text.trim()).filter(t => t && t !== 'Select All');
    });
    filters.disciplines = disciplineOptions.length > 0 ? disciplineOptions : ['Select All'];

    // Extract Province options
    const provinceOptions = await page.evaluate(() => {
      const select = document.querySelector('select[name*="Province"], select[id*="Province"]');
      if (!select) return [];
      return Array.from(select.options).map(opt => opt.text.trim()).filter(t => t && t !== 'Select All');
    });
    filters.provinces = provinceOptions.length > 0 ? provinceOptions : ['Select All'];

    // Extract City options
    const cityOptions = await page.evaluate(() => {
      const select = document.querySelector('select[name*="City"], select[id*="City"]');
      if (!select) return [];
      return Array.from(select.options).map(opt => opt.text.trim()).filter(t => t && t !== 'Select All');
    });
    filters.cities = cityOptions.length > 0 ? cityOptions : ['Select All'];

    // If we couldn't find selects, try alternative selectors
    if (filters.sectors.length === 0 || filters.sectors[0] === 'Select All') {
      console.log('⚠️  Could not find filter dropdowns. Trying alternative method...');
      // Alternative: Click on filters and extract options
      filters.sectors = await extractOptionsByClicking(page, 'Sector');
      filters.charteredBy = await extractOptionsByClicking(page, 'Chartered By');
      filters.disciplines = await extractOptionsByClicking(page, 'Discipline');
      filters.provinces = await extractOptionsByClicking(page, 'Province');
      filters.cities = await extractOptionsByClicking(page, 'City');
    }

  } catch (error) {
    console.error('❌ Error extracting filter options:', error);
    // Fallback to default values
    filters.sectors = ['Select All'];
    filters.charteredBy = ['Select All'];
    filters.disciplines = ['Select All'];
    filters.provinces = ['Select All'];
    filters.cities = ['Select All'];
  }

  return filters;
}

/**
 * Alternative method: Extract options by clicking on filter elements
 */
async function extractOptionsByClicking(page, filterName) {
  try {
    // Try to find and click the filter
    const filterSelector = `text=${filterName}`;
    await page.click(filterSelector);
    await page.waitForTimeout(1000);

    // Extract options from dropdown
    const options = await page.evaluate(() => {
      const dropdown = document.querySelector('.dropdown-menu, .select-options, [role="listbox"]');
      if (!dropdown) return [];
      return Array.from(dropdown.querySelectorAll('li, option, .option')).map(el => el.textContent.trim());
    });

    return options.filter(opt => opt && opt !== 'Select All');
  } catch (error) {
    console.error(`Error extracting ${filterName}:`, error);
    return ['Select All'];
  }
}

/**
 * Apply filters and scrape universities
 */
async function applyFiltersAndScrape(page, filters) {
  try {
    // Navigate back to base URL if needed
    const currentUrl = page.url();
    if (!currentUrl.includes('recognised.aspx')) {
      // Use retry mechanism for navigation
      let navSuccess = false;
      const strategies = [
        { waitUntil: 'load', timeout: 120000 },
        { waitUntil: 'domcontentloaded', timeout: 120000 }
      ];
      
      for (const strategy of strategies) {
        try {
          await page.goto('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx', strategy);
          navSuccess = true;
          break;
        } catch (error) {
          // Try next strategy
        }
      }
      
      if (!navSuccess) {
        throw new Error('Failed to navigate to HEC page');
      }
      
      await page.waitForTimeout(3000);
    }

    // Apply filters
    await applyFilter(page, 'Sector', filters.sector);
    await page.waitForTimeout(500);
    
    await applyFilter(page, 'Chartered By', filters.charteredBy);
    await page.waitForTimeout(500);
    
    await applyFilter(page, 'Discipline', filters.discipline);
    await page.waitForTimeout(500);
    
    await applyFilter(page, 'Province', filters.province);
    await page.waitForTimeout(500);
    
    await applyFilter(page, 'City', filters.city);
    await page.waitForTimeout(2000); // Wait for results to load

    // Scrape universities from current page
    const universities = await scrapeUniversitiesFromPage(page);
    
    // Process and save universities
    for (const uni of universities) {
      if (!scrapedUniversities.has(uni.name)) {
        scrapedUniversities.add(uni.name);
        await saveUniversity(uni);
        totalScraped++;
      }
    }

    // Check for pagination and scrape additional pages
    let hasNextPage = true;
    let pageNum = 1;
    
    while (hasNextPage && pageNum < 10) { // Limit to 10 pages per combination
      hasNextPage = await checkAndClickNextPage(page);
      if (hasNextPage) {
        await page.waitForTimeout(2000);
        const moreUniversities = await scrapeUniversitiesFromPage(page);
        for (const uni of moreUniversities) {
          if (!scrapedUniversities.has(uni.name)) {
            scrapedUniversities.add(uni.name);
            await saveUniversity(uni);
            totalScraped++;
          }
        }
        pageNum++;
      }
    }

  } catch (error) {
    console.error(`Error in applyFiltersAndScrape:`, error.message);
    throw error;
  }
}

/**
 * Apply a single filter
 */
async function applyFilter(page, filterName, filterValue) {
  try {
    // Try multiple selector strategies
    const selectors = [
      `select[name*="${filterName}"]`,
      `select[id*="${filterName}"]`,
      `select[title*="${filterName}"]`,
      `select:has(option:contains("${filterName}"))`
    ];

    let selectElement = null;
    for (const selector of selectors) {
      try {
        selectElement = await page.$(selector);
        if (selectElement) break;
      } catch (e) {
        continue;
      }
    }

    if (!selectElement) {
      // Try clicking on filter label and selecting from dropdown
      const labelSelector = `label:has-text("${filterName}"), span:has-text("${filterName}")`;
      await page.click(labelSelector);
      await page.waitForTimeout(500);
      
      // Select option
      const optionSelector = `text=${filterValue}`;
      await page.click(optionSelector);
      return;
    }

    // Use select element
    await page.select(selectors.find(s => selectElement), filterValue);
    
  } catch (error) {
    // If direct selection fails, try alternative method
    try {
      await page.evaluate((name, value) => {
        const selects = Array.from(document.querySelectorAll('select'));
        const select = selects.find(s => 
          s.name?.toLowerCase().includes(name.toLowerCase()) ||
          s.id?.toLowerCase().includes(name.toLowerCase())
        );
        if (select) {
          const option = Array.from(select.options).find(opt => 
            opt.text.trim() === value || opt.value === value
          );
          if (option) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, filterName, filterValue);
    } catch (e) {
      console.error(`Could not apply filter ${filterName}:`, e.message);
    }
  }
}

/**
 * Scrape universities from current page
 */
async function scrapeUniversitiesFromPage(page) {
  const universities = await page.evaluate(() => {
    const uniCards = [];
    
    // Try multiple selectors for university cards
    const cardSelectors = [
      '.university-card',
      '.uni-card',
      '[class*="university"]',
      '[class*="card"]',
      'div[class*="item"]',
      'li[class*="university"]'
    ];

    let cards = [];
    for (const selector of cardSelectors) {
      cards = Array.from(document.querySelectorAll(selector));
      if (cards.length > 0) break;
    }

    // If no cards found, try finding by text pattern
    if (cards.length === 0) {
      const allDivs = Array.from(document.querySelectorAll('div, li, article'));
      cards = allDivs.filter(el => {
        const text = el.textContent || '';
        return text.includes('University') || text.includes('Institute');
      });
    }

    cards.forEach(card => {
      try {
        const text = card.textContent || '';
        const nameMatch = text.match(/([A-Z][^,\n]+(?:University|Institute|College)[^,\n]*)/);
        
        if (nameMatch) {
          const name = nameMatch[1].trim();
          const locationMatch = text.match(/(?:\(|,)\s*([A-Z][^)]+)\)/);
          const location = locationMatch ? locationMatch[1].trim() : '';
          
          // Extract link if available
          const link = card.querySelector('a')?.href || '';
          
          if (name && !uniCards.find(u => u.name === name)) {
            uniCards.push({
              name: name,
              location: location,
              link: link,
              rawText: text.substring(0, 200) // First 200 chars for debugging
            });
          }
        }
      } catch (e) {
        // Skip this card
      }
    });

    return uniCards;
  });

  return universities;
}

/**
 * Check for next page and click if available
 */
async function checkAndClickNextPage(page) {
  try {
    const hasNext = await page.evaluate(() => {
      const nextButton = Array.from(document.querySelectorAll('a, button')).find(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('next') || text.includes('>') || el.getAttribute('aria-label')?.toLowerCase().includes('next');
      });
      
      if (nextButton && !nextButton.disabled && !nextButton.classList.contains('disabled')) {
        nextButton.click();
        return true;
      }
      return false;
    });

    return hasNext;
  } catch (error) {
    return false;
  }
}

/**
 * Save university to database
 */
async function saveUniversity(uniData) {
  try {
    // Parse location to extract city and province
    const location = uniData.location || '';
    const cityMatch = location.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const city = cityMatch ? cityMatch[1] : location.split(',')[0] || '';
    
    // Determine province from city (basic mapping)
    const provinceMap = {
      'Islamabad': 'Islamabad Capital Territory',
      'Lahore': 'Punjab',
      'Karachi': 'Sindh',
      'Quetta': 'Balochistan',
      'Peshawar': 'Khyber Pakhtunkhwa'
    };
    
    let province = 'Unknown';
    for (const [cityName, prov] of Object.entries(provinceMap)) {
      if (location.includes(cityName)) {
        province = prov;
        break;
      }
    }

    // Check if university already exists
    const existing = await University.findOne({ name: uniData.name });
    
    if (existing) {
      // Update if needed
      if (uniData.link && !existing.website) {
        existing.website = uniData.link;
        await existing.save();
      }
      return;
    }

    // Create new university
    const university = await University.create({
      name: uniData.name,
      city: city || 'Unknown',
      type: 'Public', // Default, can be updated later
      website: uniData.link || '',
      description: `HEC Recognized University located in ${location || city}`
    });

    console.log(`   ✅ Saved: ${uniData.name} (${city})`);
    
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (already exists)
      return;
    }
    console.error(`   ❌ Error saving ${uniData.name}:`, error.message);
  }
}

