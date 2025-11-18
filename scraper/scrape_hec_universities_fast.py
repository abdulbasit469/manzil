"""
FAST HEC University Scraper - Optimized Version
Uses smart strategies to scrape faster
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from pymongo import MongoClient
from dotenv import load_dotenv

# Try to import webdriver_manager
try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/manzil')
client = MongoClient(MONGO_URI)
db = client['manzil']
universities_collection = db['universities']

scraped_universities = set()
total_scraped = 0


def setup_driver():
    """Setup Chrome driver"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = None
    
    # Try built-in driver first
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.maximize_window()
        return driver
    except:
        pass
    
    # Try webdriver-manager
    if WEBDRIVER_MANAGER_AVAILABLE:
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            driver.maximize_window()
            return driver
        except:
            pass
    
    raise Exception("Could not setup ChromeDriver")


def scrape_all_universities_fast(driver):
    """FAST Strategy: Scrape all universities at once using 'Select All' filters"""
    print("\n🚀 FAST MODE: Scraping all universities at once...\n")
    
    try:
        # Navigate to page
        driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
        time.sleep(3)
        
        # Set all filters to "Select All" to get ALL universities
        print("   Setting filters to 'Select All' to get all universities...")
        
        # Apply "Select All" to all filters
        try:
            select_sector = Select(driver.find_element(By.ID, 'Sector'))
            select_sector.select_by_visible_text('Select All')
            time.sleep(0.5)
        except:
            pass
        
        try:
            select_charter = Select(driver.find_element(By.ID, 'Charter'))
            select_charter.select_by_visible_text('Select All')
            time.sleep(0.5)
        except:
            pass
        
        try:
            select_disc = Select(driver.find_element(By.ID, 'Disc'))
            select_disc.select_by_visible_text('Select All')
            time.sleep(0.5)
        except:
            pass
        
        try:
            select_province = Select(driver.find_element(By.ID, 'Province'))
            select_province.select_by_visible_text('Select All')
            time.sleep(0.5)
        except:
            pass
        
        try:
            select_city = Select(driver.find_element(By.ID, 'City'))
            select_city.select_by_visible_text('Select All')
            time.sleep(2)  # Wait for results
        except:
            pass
        
        # Wait for universities to load
        print("   Waiting for universities to load...")
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//li[contains(text(), 'University') or contains(text(), 'Institute')]"))
        )
        
        # Scrape all universities from current page
        universities = []
        page_num = 1
        
        while True:
            print(f"\n   📄 Scraping page {page_num}...")
            
            # Get all university list items
            li_elements = driver.find_elements(By.XPATH, "//li[contains(text(), 'University') or contains(text(), 'Institute') or contains(text(), 'College')]")
            
            if not li_elements:
                break
            
            page_universities = []
            for li in li_elements:
                try:
                    text = li.text.strip()
                    if not text or len(text) < 10:
                        continue
                    
                    # Skip headers
                    if text.lower() in ['university', 'universities', 'select all']:
                        continue
                    
                    # Extract name (first line)
                    lines = [line.strip() for line in text.split('\n') if line.strip()]
                    if not lines:
                        continue
                    
                    name = lines[0]
                    name = ' '.join(name.split())
                    
                    # Validate
                    if len(name) < 5 or ('University' not in name and 'Institute' not in name and 'College' not in name):
                        continue
                    
                    # Extract location
                    location = ''
                    if len(lines) > 1:
                        location = lines[1]
                    
                    # Extract link
                    link = ''
                    try:
                        link_elem = li.find_element(By.TAG_NAME, 'a')
                        link = link_elem.get_attribute('href') or ''
                    except:
                        pass
                    
                    if name not in [u['name'] for u in page_universities]:
                        page_universities.append({
                            'name': name,
                            'location': location,
                            'link': link
                        })
                except:
                    continue
            
            universities.extend(page_universities)
            print(f"   ✅ Found {len(page_universities)} universities on page {page_num}")
            
            # Try to go to next page
            try:
                next_button = driver.find_element(By.XPATH, "//a[contains(text(), 'Next') or contains(@class, 'next')]")
                if next_button and next_button.is_enabled():
                    next_button.click()
                    time.sleep(2)
                    page_num += 1
                else:
                    break
            except:
                # No next page
                break
        
        print(f"\n   ✅ Total universities found: {len(universities)}")
        return universities
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return []


def save_university_batch(universities):
    """Save universities in batch"""
    global total_scraped
    
    saved_count = 0
    updated_count = 0
    
    for uni_data in universities:
        try:
            name = uni_data['name']
            if name in scraped_universities:
                continue
            
            # Parse location
            location = uni_data.get('location', '')
            city = location.split(',')[0].strip() if location else 'Unknown'
            
            # Province mapping
            province_map = {
                'Islamabad': 'Islamabad Capital Territory',
                'Lahore': 'Punjab',
                'Karachi': 'Sindh',
                'Quetta': 'Balochistan',
                'Peshawar': 'Khyber Pakhtunkhwa'
            }
            
            province = 'Unknown'
            for city_name, prov in province_map.items():
                if city_name in location:
                    province = prov
                    break
            
            # Check if exists
            existing = universities_collection.find_one({'name': name})
            
            if existing:
                # Update if needed
                if uni_data.get('link') and not existing.get('website'):
                    universities_collection.update_one(
                        {'name': name},
                        {'$set': {'website': uni_data['link']}}
                    )
                    updated_count += 1
            else:
                # Create new
                university = {
                    'name': name,
                    'city': city,
                    'type': 'Public',  # Default
                    'website': uni_data.get('link', ''),
                    'description': f"HEC Recognized University located in {location or city}"
                }
                
                universities_collection.insert_one(university)
                scraped_universities.add(name)
                saved_count += 1
                total_scraped += 1
                
        except Exception as e:
            if 'duplicate' not in str(e).lower():
                print(f"      ⚠️  Error saving {uni_data.get('name', 'Unknown')}: {e}")
    
    return saved_count, updated_count


def main():
    """Main function - FAST MODE"""
    print("🚀 Starting FAST HEC University Scraper...\n")
    
    driver = setup_driver()
    
    try:
        # FAST MODE: Get all universities at once
        universities = scrape_all_universities_fast(driver)
        
        if universities:
            print(f"\n💾 Saving {len(universities)} universities to database...")
            saved, updated = save_university_batch(universities)
            print(f"\n✅ Scraping Complete!")
            print(f"   📊 Total Universities Found: {len(universities)}")
            print(f"   💾 New Universities Saved: {saved}")
            print(f"   🔄 Universities Updated: {updated}")
            print(f"   📝 Total Unique: {len(scraped_universities)}")
        else:
            print("\n⚠️  No universities found!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        print("\n⏳ Closing browser...")
        time.sleep(2)
        driver.quit()
        client.close()
        print("👋 Done!")


if __name__ == '__main__':
    main()

