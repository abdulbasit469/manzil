"""
Simplified HEC University Scraper - More Reliable Version
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
import re

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/manzil')
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ MongoDB connected!")
except Exception as e:
    print(f"❌ MongoDB error: {e}")
    raise

db = client['manzil']
universities_collection = db['universities']

scraped_universities = set()
total_scraped = 0

def setup_driver():
    """Setup Chrome driver"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.page_load_strategy = 'eager'
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.maximize_window()
    driver.set_page_load_timeout(120)
    driver.implicitly_wait(5)
    return driver

def apply_filter_simple(driver, filter_id, value):
    """Apply filter using JavaScript to avoid timeout"""
    try:
        script = f"""
        var select = document.getElementById('{filter_id}');
        if (select) {{
            select.value = '';
            for (var i = 0; i < select.options.length; i++) {{
                if (select.options[i].text.trim() === '{value}') {{
                    select.options[i].selected = true;
                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    break;
                }}
            }}
        }}
        """
        driver.execute_script(script)
        time.sleep(1)
        return True
    except:
        return False

def scrape_universities_simple(driver):
    """Simple scraping method"""
    universities = []
    time.sleep(3)  # Wait for results
    
    try:
        # Get all list items
        all_lis = driver.find_elements(By.XPATH, "//li")
        
        for li in all_lis:
            try:
                text = li.text.strip()
                if not text or len(text) < 10:
                    continue
                
                # Check if it's a university
                if 'University' not in text and 'Institute' not in text and 'College' not in text:
                    continue
                
                # Skip headers
                if text.lower() in ['university', 'universities', 'select all']:
                    continue
                
                lines = [l.strip() for l in text.split('\n') if l.strip()]
                if not lines:
                    continue
                
                name = lines[0]
                location = lines[1] if len(lines) > 1 else ''
                
                # Clean name
                name = re.sub(r'\s+', ' ', name).strip()
                
                if name and len(name) > 5:
                    universities.append({
                        'name': name,
                        'location': location,
                        'link': ''
                    })
            except:
                continue
    except Exception as e:
        print(f"      Error scraping: {e}")
    
    return universities

def save_university_simple(uni_data):
    """Save university - simple version"""
    global total_scraped
    
    try:
        name = uni_data.get('name', '').strip()
        if not name:
            return
        
        # Check if exists
        if universities_collection.find_one({'name': name}):
            return
        
        # Parse city
        location = uni_data.get('location', '')
        city = 'Unknown'
        if location:
            city = location.split(',')[0].strip()
        
        # Determine type
        uni_type = 'Private' if 'private' in name.lower() else 'Public'
        
        # Save
        university = {
            'name': name,
            'city': city,
            'type': uni_type,
            'website': uni_data.get('link', ''),
            'description': f"HEC Recognized University in {location or city}"
        }
        
        universities_collection.insert_one(university)
        total_scraped += 1
        print(f"      ✅ Saved: {name} ({city})")
        
    except Exception as e:
        if 'duplicate' not in str(e).lower() and 'e11000' not in str(e).lower():
            print(f"      ❌ Error: {e}")

def main():
    global total_scraped
    
    print("🚀 Starting Simplified HEC Scraper...\n")
    
    driver = setup_driver()
    
    try:
        # Load page
        print("📄 Loading HEC website...")
        driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
        time.sleep(10)
        print("✅ Page loaded!\n")
        
        # Limited filters as requested
        provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Islamabad Capital Territory']
        cities = ['Islamabad', 'Rawalpindi', 'Karachi', 'Lahore', 'Peshawar']
        sectors = ['Public', 'Private']
        disciplines = ['Select All']  # All disciplines
        chartered_by = ['Select All']  # All chartered by
        
        total_combinations = len(sectors) * len(provinces) * len(cities)
        current = 0
        
        print(f"📊 Total combinations: {total_combinations}\n")
        
        for sector in sectors:
            for province in provinces:
                for city in cities:
                    current += 1
                    print(f"\n[{current}/{total_combinations}] {sector} | {province} | {city}")
                    
                    try:
                        # Reload page
                        driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
                        time.sleep(5)
                        
                        # Apply filters using JavaScript (faster, no timeout)
                        apply_filter_simple(driver, 'Sector', sector)
                        time.sleep(1)
                        apply_filter_simple(driver, 'Province', province)
                        time.sleep(1)
                        apply_filter_simple(driver, 'City', city)
                        time.sleep(3)  # Wait for results
                        
                        # Scrape
                        universities = scrape_universities_simple(driver)
                        
                        if universities:
                            print(f"   ✅ Found {len(universities)} universities")
                            saved = 0
                            for uni in universities:
                                if uni['name'] not in scraped_universities:
                                    scraped_universities.add(uni['name'])
                                    save_university_simple(uni)
                                    saved += 1
                            if saved > 0:
                                print(f"   💾 Saved {saved} new universities")
                        else:
                            print(f"   ⚠️  No universities found")
                            
                    except Exception as e:
                        print(f"   ❌ Error: {str(e)[:60]}")
                        continue
        
        print(f"\n\n✅ Complete! Total saved: {total_scraped}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        time.sleep(3)
        driver.quit()
        client.close()

if __name__ == '__main__':
    main()




