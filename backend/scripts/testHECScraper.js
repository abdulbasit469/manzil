const puppeteer = require('puppeteer');

/**
 * Test script to inspect HEC website structure
 * This will help us understand the actual HTML structure before full scraping
 */
async function testHECStructure() {
  console.log('🔍 Testing HEC Website Structure...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Keep visible to see what's happening
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.setViewport({ width: 1920, height: 1080 });
    
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

    console.log('⏳ Waiting for page content to fully render...');
    await page.waitForTimeout(8000); // Give extra time for dynamic content

    // Inspect page structure
    console.log('\n📊 Inspecting Page Structure...\n');
    
    const pageInfo = await page.evaluate(() => {
      const info = {
        title: document.title,
        url: window.location.href,
        filters: {},
        universities: [],
        selectors: {}
      };

      // Find all select elements
      const selects = Array.from(document.querySelectorAll('select'));
      info.selects = selects.map((sel, idx) => ({
        index: idx,
        name: sel.name || 'no-name',
        id: sel.id || 'no-id',
        className: sel.className || 'no-class',
        options: Array.from(sel.options).map(opt => ({
          text: opt.text.trim(),
          value: opt.value
        })).slice(0, 10) // First 10 options
      }));

      // Find filter labels
      const labels = Array.from(document.querySelectorAll('label, span, div')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('sector') || 
               text.includes('chartered') || 
               text.includes('discipline') || 
               text.includes('province') || 
               text.includes('city');
      });

      info.filterLabels = labels.slice(0, 10).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50),
        className: el.className,
        id: el.id
      }));

      // Find university cards/elements
      const uniElements = Array.from(document.querySelectorAll('div, li, article, section')).filter(el => {
        const text = el.textContent || '';
        return text.includes('University') || text.includes('Institute');
      });

      info.universityElements = uniElements.slice(0, 5).map(el => ({
        tag: el.tagName,
        className: el.className,
        id: el.id,
        text: el.textContent?.trim().substring(0, 100)
      }));

      // Find all classes that might be related to filters
      const allClasses = Array.from(document.querySelectorAll('*')).map(el => el.className)
        .filter(cls => cls && typeof cls === 'string')
        .filter(cls => cls.includes('filter') || cls.includes('select') || cls.includes('dropdown'))
        .slice(0, 20);

      info.filterClasses = [...new Set(allClasses)];

      return info;
    });

    // Print results
    console.log('📋 Page Information:');
    console.log(`   Title: ${pageInfo.title}`);
    console.log(`   URL: ${pageInfo.url}\n`);

    console.log('🔽 Select Elements Found:');
    pageInfo.selects.forEach((sel, idx) => {
      console.log(`\n   Select #${idx + 1}:`);
      console.log(`      Name: ${sel.name}`);
      console.log(`      ID: ${sel.id}`);
      console.log(`      Class: ${sel.className}`);
      console.log(`      Options (first 10):`);
      sel.options.forEach(opt => {
        console.log(`         - ${opt.text} (value: ${opt.value})`);
      });
    });

    console.log('\n🏷️  Filter Labels Found:');
    pageInfo.filterLabels.forEach((label, idx) => {
      console.log(`   ${idx + 1}. [${label.tag}] ${label.text}`);
      console.log(`      Class: ${label.className}, ID: ${label.id}`);
    });

    console.log('\n🎓 University Elements Found:');
    pageInfo.universityElements.forEach((uni, idx) => {
      console.log(`   ${idx + 1}. [${uni.tag}] ${uni.text}`);
      console.log(`      Class: ${uni.className}, ID: ${uni.id}`);
    });

    console.log('\n🎨 Filter-Related Classes:');
    pageInfo.filterClasses.forEach(cls => {
      console.log(`   - ${cls}`);
    });

    // Try to extract filter options
    console.log('\n\n🔍 Attempting to Extract Filter Options...\n');
    
    const filterOptions = await page.evaluate(() => {
      const filters = {};
      
      // Try to find selects by common patterns
      const sectorSelect = Array.from(document.querySelectorAll('select')).find(s => 
        s.name?.toLowerCase().includes('sector') || 
        s.id?.toLowerCase().includes('sector') ||
        s.previousElementSibling?.textContent?.toLowerCase().includes('sector')
      );
      
      if (sectorSelect) {
        filters.sector = Array.from(sectorSelect.options).map(opt => opt.text.trim());
      }

      const charteredSelect = Array.from(document.querySelectorAll('select')).find(s => 
        s.name?.toLowerCase().includes('chartered') || 
        s.id?.toLowerCase().includes('chartered')
      );
      
      if (charteredSelect) {
        filters.charteredBy = Array.from(charteredSelect.options).map(opt => opt.text.trim());
      }

      const disciplineSelect = Array.from(document.querySelectorAll('select')).find(s => 
        s.name?.toLowerCase().includes('discipline') || 
        s.id?.toLowerCase().includes('discipline')
      );
      
      if (disciplineSelect) {
        filters.discipline = Array.from(disciplineSelect.options).map(opt => opt.text.trim());
      }

      const provinceSelect = Array.from(document.querySelectorAll('select')).find(s => 
        s.name?.toLowerCase().includes('province') || 
        s.id?.toLowerCase().includes('province')
      );
      
      if (provinceSelect) {
        filters.province = Array.from(provinceSelect.options).map(opt => opt.text.trim());
      }

      const citySelect = Array.from(document.querySelectorAll('select')).find(s => 
        s.name?.toLowerCase().includes('city') || 
        s.id?.toLowerCase().includes('city')
      );
      
      if (citySelect) {
        filters.city = Array.from(citySelect.options).map(opt => opt.text.trim());
      }

      return filters;
    });

    console.log('📊 Extracted Filter Options:');
    Object.entries(filterOptions).forEach(([key, values]) => {
      if (values && values.length > 0) {
        console.log(`\n   ${key.toUpperCase()}:`);
        values.slice(0, 20).forEach(val => console.log(`      - ${val}`));
        if (values.length > 20) {
          console.log(`      ... and ${values.length - 20} more`);
        }
      }
    });

    // Test scraping a few universities
    console.log('\n\n🎓 Testing University Scraping...\n');
    
    const testUniversities = await page.evaluate(() => {
      const universities = [];
      
      // Try multiple strategies to find university elements
      const strategies = [
        () => Array.from(document.querySelectorAll('.university-card, .uni-card')),
        () => Array.from(document.querySelectorAll('[class*="university"]')),
        () => Array.from(document.querySelectorAll('div[class*="card"]')),
        () => Array.from(document.querySelectorAll('li, div, article')).filter(el => {
          const text = el.textContent || '';
          return text.includes('University') || text.includes('Institute');
        })
      ];

      let found = false;
      for (const strategy of strategies) {
        const elements = strategy();
        if (elements.length > 0) {
          elements.slice(0, 10).forEach(el => {
            const text = el.textContent || '';
            const nameMatch = text.match(/([A-Z][^,\n]+(?:University|Institute)[^,\n]*)/);
            if (nameMatch) {
              universities.push({
                name: nameMatch[1].trim(),
                fullText: text.substring(0, 150),
                html: el.outerHTML.substring(0, 200)
              });
            }
          });
          found = true;
          break;
        }
      }

      return universities;
    });

    console.log(`✅ Found ${testUniversities.length} universities on current page:\n`);
    testUniversities.forEach((uni, idx) => {
      console.log(`   ${idx + 1}. ${uni.name}`);
      console.log(`      Text: ${uni.fullText.substring(0, 80)}...`);
    });

    console.log('\n\n✅ Test Complete!');
    console.log('📝 Review the output above to understand the page structure.');
    console.log('💡 Use this information to adjust the main scraper if needed.\n');

    // Keep browser open for 10 seconds so user can inspect
    console.log('⏳ Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed.');
    process.exit(0);
  }
}

// Run test
testHECStructure().catch(console.error);

