"""
Test script to inspect HEC website structure before full scraping
"""

import time
import os
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Try to import webdriver_manager, but handle if it fails
try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False
    print("⚠️  webdriver-manager not available, will try alternative methods")


def setup_driver():
    """Setup Chrome driver with multiple fallback methods"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = None
    
    # Method 1: Try using Chrome's built-in driver (Chrome 115+)
    try:
        print("   Trying Chrome's built-in driver...")
        driver = webdriver.Chrome(options=chrome_options)
        print("   ✅ Success with built-in driver!")
        driver.maximize_window()
        return driver
    except Exception as e:
        print(f"   ⚠️  Built-in driver failed: {e}")
    
    # Method 2: Try webdriver-manager
    if WEBDRIVER_MANAGER_AVAILABLE:
        try:
            print("   Trying webdriver-manager...")
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            print("   ✅ Success with webdriver-manager!")
            driver.maximize_window()
            return driver
        except Exception as e:
            print(f"   ⚠️  webdriver-manager failed: {e}")
    
    # Method 3: Try common ChromeDriver paths
    common_paths = [
        r'C:\Program Files\Google\Chrome\Application\chromedriver.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe',
        os.path.join(os.getcwd(), 'chromedriver.exe'),
        os.path.join(os.path.expanduser('~'), 'chromedriver.exe')
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            try:
                print(f"   Trying ChromeDriver at: {path}")
                service = Service(path)
                driver = webdriver.Chrome(service=service, options=chrome_options)
                print("   ✅ Success with local ChromeDriver!")
                driver.maximize_window()
                return driver
            except Exception as e:
                print(f"   ⚠️  Failed with {path}: {e}")
                continue
    
    # If all methods fail, raise error with instructions
    raise Exception("""
❌ Could not setup ChromeDriver!

Please try one of these solutions:

1. Update Chrome browser to latest version (Chrome 115+ has built-in driver)
   Download: https://www.google.com/chrome/

2. Manually download ChromeDriver:
   - Go to: https://chromedriver.chromium.org/downloads
   - Download matching your Chrome version
   - Extract chromedriver.exe to scraper folder
   - Run script again

3. Install ChromeDriver via Chocolatey (if you have it):
   choco install chromedriver

4. Check Chrome version:
   - Open Chrome
   - Go to: chrome://version/
   - Note the version number
   - Download matching ChromeDriver
""")


def main():
    print("🔍 Testing HEC Website Structure...\n")
    
    driver = setup_driver()
    
    try:
        print("📄 Navigating to HEC website...")
        print("⏳ This may take 30-60 seconds, please wait...\n")
        
        driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
        time.sleep(8)  # Wait for page to load
        
        print("✅ Page loaded!\n")
        print("📊 Inspecting Page Structure...\n")
        
        # Find all select elements
        selects = driver.find_elements(By.TAG_NAME, 'select')
        print(f"🔽 Found {len(selects)} select elements:\n")
        
        for idx, select in enumerate(selects, 1):
            select_id = select.get_attribute('id') or 'no-id'
            select_name = select.get_attribute('name') or 'no-name'
            select_class = select.get_attribute('class') or 'no-class'
            
            print(f"   Select #{idx}:")
            print(f"      ID: {select_id}")
            print(f"      Name: {select_name}")
            print(f"      Class: {select_class}")
            
            # Get options
            options = select.find_elements(By.TAG_NAME, 'option')
            print(f"      Options ({len(options)} total):")
            for opt in options[:10]:  # First 10 options
                print(f"         - {opt.text.strip()}")
            if len(options) > 10:
                print(f"         ... and {len(options) - 10} more")
            print()
        
        # Find university elements
        print("🎓 Testing University Extraction...\n")
        
        # Try different selectors
        selectors = [
            ("//div[contains(@class, 'university')]", "University class"),
            ("//div[contains(@class, 'card')]", "Card class"),
            ("//li[contains(@class, 'university')]", "University li"),
            ("//div[contains(text(), 'University')]", "Text contains University")
        ]
        
        for xpath, description in selectors:
            try:
                elements = driver.find_elements(By.XPATH, xpath)
                if elements:
                    print(f"   ✅ {description}: Found {len(elements)} elements")
                    # Show first 3
                    for i, el in enumerate(elements[:3], 1):
                        text = el.text.strip()[:80]
                        print(f"      {i}. {text}...")
                else:
                    print(f"   ❌ {description}: No elements found")
            except Exception as e:
                print(f"   ⚠️  {description}: Error - {e}")
        
        print("\n\n✅ Test Complete!")
        print("📝 Review the output above to understand the page structure.")
        print("💡 If filters are detected, you can proceed with full scraping.\n")
        
        # Keep browser open for inspection
        print("⏳ Keeping browser open for 15 seconds for inspection...")
        time.sleep(15)
        
    except Exception as e:
        print(f"\n❌ Test Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        driver.quit()
        print("\n👋 Browser closed.")


if __name__ == '__main__':
    main()

