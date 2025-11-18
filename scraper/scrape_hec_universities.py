"""
HEC Recognized Universities Scraper
Automatically scrapes all HEC recognized universities by iterating through all filter combinations
"""

import time
import json
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from pymongo import MongoClient
from dotenv import load_dotenv

# Try to import webdriver_manager, but handle if it fails
try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/manzil')
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Test connection
    client.admin.command('ping')
    print("✅ MongoDB connection successful!")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")
    print("⚠️  Make sure MongoDB is running on localhost:27017")
    raise

db = client['manzil']
universities_collection = db['universities']
print(f"✅ Using database: {db.name}, collection: {universities_collection.name}")

# Store scraped universities to avoid duplicates
scraped_universities = set()
total_scraped = 0
total_combinations = 0
current_combination = 0


def setup_driver():
    """Setup Chrome driver with multiple fallback methods"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Use 'eager' page load strategy (faster - waits for DOM, not all resources)
    chrome_options.page_load_strategy = 'eager'  # Faster - waits for DOM ready
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-images')  # Don't load images for faster loading
    chrome_options.add_argument('--blink-settings=imagesEnabled=false')
    # Note: We need JS for filters, so don't disable it
    
    # Uncomment for headless mode
    # chrome_options.add_argument('--headless')
    
    driver = None
    
    # Method 1: Try using Chrome's built-in driver (Chrome 115+)
    try:
        print("   🔧 Trying Chrome's built-in driver...")
        driver = webdriver.Chrome(options=chrome_options)
        print("   ✅ Success with built-in driver!")
        driver.maximize_window()
        # Set timeouts
        driver.set_page_load_timeout(120)  # 2 minutes for page load
        driver.implicitly_wait(10)  # 10 seconds for element finding
        return driver
    except Exception as e:
        print(f"   ⚠️  Built-in driver failed: {e}")
    
    # Method 2: Try webdriver-manager
    if WEBDRIVER_MANAGER_AVAILABLE:
        try:
            print("   🔧 Trying webdriver-manager...")
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
                print(f"   🔧 Trying ChromeDriver at: {path}")
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

3. Check Chrome version:
   - Open Chrome
   - Go to: chrome://version/
   - Note the version number
   - Download matching ChromeDriver
""")


def check_driver_alive(driver):
    """Check if driver is still responsive"""
    try:
        driver.current_url
        return True
    except:
        return False


def restart_driver(driver):
    """Restart the driver if connection is lost"""
    try:
        driver.quit()
    except:
        pass
    time.sleep(2)
    new_driver = setup_driver()
    new_driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
    time.sleep(5)
    return new_driver


def extract_filter_options(driver):
    """Extract all filter options from the page"""
    print("\n🔍 Extracting filter options...\n")
    
    filters = {
        'sectors': [],
        'chartered_by': [],
        'disciplines': [],
        'provinces': [],
        'cities': []
    }
    
    try:
        # Wait for page to load with longer timeout
        wait = WebDriverWait(driver, 60)  # Increased to 60 seconds
        
        # Wait a bit more for selects to be available
        time.sleep(3)
        
        # Find all select elements with retry
        select_elements = []
        for attempt in range(5):
            try:
                select_elements = driver.find_elements(By.TAG_NAME, 'select')
                if select_elements and len(select_elements) > 0:
                    break
            except:
                pass
            time.sleep(2)
        
        if not select_elements:
            print("   ⚠️  No select elements found, using fallback values")
            return {
                'sectors': ['Public', 'Private'],
                'chartered_by': ['Select All'],
                'disciplines': ['Select All'],
                'provinces': ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Islamabad Capital Territory'],
                'cities': ['Islamabad', 'Rawalpindi', 'Karachi', 'Lahore', 'Peshawar']
            }
        
        for select in select_elements:
            select_id = select.get_attribute('id') or ''
            select_name = select.get_attribute('name') or ''
            select_text = select.text.lower()
            
            # Identify filter by id, name, or nearby label
            if 'sector' in select_id.lower() or 'sector' in select_name.lower():
                options = [opt.text.strip() for opt in select.find_elements(By.TAG_NAME, 'option')]
                filters['sectors'] = [opt for opt in options if opt and opt.lower() != 'select all']
                print(f"   ✅ Sector: {len(filters['sectors'])} options")
                
            elif 'chartered' in select_id.lower() or 'chartered' in select_name.lower():
                options = [opt.text.strip() for opt in select.find_elements(By.TAG_NAME, 'option')]
                filters['chartered_by'] = [opt for opt in options if opt and opt.lower() != 'select all']
                print(f"   ✅ Chartered By: {len(filters['chartered_by'])} options")
                
            elif 'discipline' in select_id.lower() or 'discipline' in select_name.lower():
                options = [opt.text.strip() for opt in select.find_elements(By.TAG_NAME, 'option')]
                filters['disciplines'] = [opt for opt in options if opt and opt.lower() != 'select all']
                print(f"   ✅ Discipline: {len(filters['disciplines'])} options")
                
            elif 'province' in select_id.lower() or 'province' in select_name.lower():
                options = [opt.text.strip() for opt in select.find_elements(By.TAG_NAME, 'option')]
                filters['provinces'] = [opt for opt in options if opt and opt.lower() != 'select all']
                print(f"   ✅ Province: {len(filters['provinces'])} options")
                
            elif 'city' in select_id.lower() or 'city' in select_name.lower():
                options = [opt.text.strip() for opt in select.find_elements(By.TAG_NAME, 'option')]
                filters['cities'] = [opt for opt in options if opt and opt.lower() != 'select all']
                print(f"   ✅ City: {len(filters['cities'])} options")
        
        # If no filters found, try alternative method
        if not any(filters.values()):
            print("   ⚠️  Could not find filters using standard method. Trying alternative...")
            filters = extract_filters_alternative(driver)
        
        # Set defaults if still empty
        if not filters['sectors']:
            filters['sectors'] = ['Select All']
        if not filters['chartered_by']:
            filters['chartered_by'] = ['Select All']
        if not filters['disciplines']:
            filters['disciplines'] = ['Select All']
        if not filters['provinces']:
            filters['provinces'] = ['Select All']
        if not filters['cities']:
            filters['cities'] = ['Select All']
            
    except Exception as e:
        print(f"   ❌ Error extracting filters: {e}")
        # Set defaults
        filters = {
            'sectors': ['Select All'],
            'chartered_by': ['Select All'],
            'disciplines': ['Select All'],
            'provinces': ['Select All'],
            'cities': ['Select All']
        }
    
    return filters


def extract_filters_alternative(driver):
    """Alternative method to extract filters"""
    filters = {
        'sectors': [],
        'chartered_by': [],
        'disciplines': [],
        'provinces': [],
        'cities': []
    }
    
    try:
        # Look for filter labels and their associated selects
        labels = driver.find_elements(By.XPATH, "//label | //span | //div[contains(@class, 'filter')]")
        
        for label in labels:
            label_text = label.text.lower()
            if 'sector' in label_text:
                # Find nearby select
                select = label.find_element(By.XPATH, "./following-sibling::select | ./parent::*/select")
                options = [opt.text.strip() for opt in select.find_elements(By.TAG_NAME, 'option')]
                filters['sectors'] = [opt for opt in options if opt and opt.lower() != 'select all']
    except:
        pass
    
    return filters


def apply_filter(driver, filter_name, filter_value):
    """Apply a single filter using exact IDs from test - with timeout protection"""
    try:
        # Map filter names to exact IDs found in test
        filter_id_map = {
            'Sector': 'Sector',
            'Chartered By': 'Charter',
            'Discipline': 'Disc',
            'Province': 'Province',
            'City': 'City'
        }
        
        filter_id = filter_id_map.get(filter_name, filter_name)
        
        # Try multiple times with timeout protection
        for attempt in range(3):
            try:
                # Find select by ID with wait
                try:
                    select = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.ID, filter_id))
                    )
                except:
                    # Try finding by name
                    selects = driver.find_elements(By.TAG_NAME, 'select')
                    select = None
                    for s in selects:
                        s_id = s.get_attribute('id') or ''
                        s_name = s.get_attribute('name') or ''
                        if filter_id.lower() in s_id.lower() or filter_id.lower() in s_name.lower():
                            select = s
                            break
                    
                    if not select:
                        if attempt < 2:
                            time.sleep(1)
                            continue
                        return False
                
                # Create Select object and select value
                select_obj = Select(select)
                
                # Try to select by visible text
                try:
                    select_obj.select_by_visible_text(filter_value)
                    # Verify selection worked
                    selected_value = select.first_selected_option.text
                    if filter_value in selected_value or selected_value in filter_value:
                        return True
                except:
                    # Try by value attribute
                    try:
                        for option in select.find_elements(By.TAG_NAME, 'option'):
                            if option.text.strip() == filter_value:
                                option.click()
                                return True
                    except:
                        pass
                
                # If we get here, selection might have worked anyway
                return True
                
            except TimeoutException:
                if attempt < 2:
                    time.sleep(1)
                    continue
                return False
            except Exception as e:
                if attempt < 2:
                    time.sleep(1)
                    continue
                # Don't print error on last attempt, will be handled by caller
                return False
        
        return False
    except Exception as e:
        # Silent fail - let caller handle
        return False


def scrape_universities_from_page(driver):
    """Scrape universities from current page - optimized with proper waits"""
    universities = []
    
    try:
        import re
        
        # Wait for university list to load with multiple strategies
        try:
            # Strategy 1: Wait for li elements
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//li[contains(text(), 'University') or contains(text(), 'Institute') or contains(text(), 'College')]"))
            )
        except:
            try:
                # Strategy 2: Wait for any list items
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//li"))
                )
            except:
                # Strategy 3: Wait for any divs with university text
                try:
                    WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'University')]"))
                    )
                except:
                    # If still nothing, wait a bit and try anyway
                    time.sleep(2)
        
        # Additional delay for dynamic content
        time.sleep(1.5)
        
        # Find all li elements containing universities - try multiple methods
        li_elements = []
        
        # Method 1: Direct XPath
        try:
            li_elements = driver.find_elements(By.XPATH, "//li[contains(text(), 'University') or contains(text(), 'Institute') or contains(text(), 'College')]")
        except:
            pass
        
        # Method 2: Get all li and filter
        if not li_elements or len(li_elements) < 2:
            try:
                all_lis = driver.find_elements(By.XPATH, "//li")
                li_elements = [li for li in all_lis if 'University' in li.text or 'Institute' in li.text or 'College' in li.text]
            except:
                pass
        
        # Method 3: Try divs if li not working
        if not li_elements or len(li_elements) < 2:
            try:
                divs = driver.find_elements(By.XPATH, "//div[contains(@class, 'card') or contains(@class, 'item')]")
                li_elements = [div for div in divs if 'University' in div.text or 'Institute' in div.text]
            except:
                pass
        
        # Method 4: Last resort - find by text anywhere
        if not li_elements or len(li_elements) < 2:
            try:
                all_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'University') or contains(text(), 'Institute')]")
                # Filter to get parent containers
                li_elements = []
                for elem in all_elements:
                    parent = elem.find_element(By.XPATH, "./..")
                    if parent and parent not in li_elements:
                        li_elements.append(parent)
            except:
                pass
        
        for li in li_elements:
            try:
                text = li.text.strip()
                if not text or len(text) < 10:
                    continue
                
                # Skip if it's just a header or filter text
                if text.lower() in ['university', 'universities', 'select all', 'filter']:
                    continue
                
                # Extract university name (first line usually)
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                if not lines:
                    continue
                
                name = lines[0]
                
                # Clean name - remove extra whitespace and special chars
                name = ' '.join(name.split())
                name = re.sub(r'\s+', ' ', name)
                
                # Skip if name is too short or doesn't contain keywords
                if len(name) < 5 or ('University' not in name and 'Institute' not in name and 'College' not in name):
                    continue
                
                # Extract location (usually second line or in parentheses)
                location = ''
                if len(lines) > 1:
                    # Take second line as location
                    location = lines[1]
                    # Sometimes location is in third line
                    if len(lines) > 2 and ('Punjab' in lines[2] or 'Sindh' in lines[2] or 'Khyber' in lines[2] or 'Islamabad' in lines[2]):
                        location = lines[1] + ', ' + lines[2]
                else:
                    # Try to find in parentheses
                    location_match = re.search(r'\(([^)]+)\)', text)
                    if location_match:
                        location = location_match.group(1).strip()
                
                # Clean location - remove extra whitespace
                location = ' '.join(location.split()) if location else ''
                
                # Extract link if available
                link = ''
                try:
                    link_elem = li.find_element(By.TAG_NAME, 'a')
                    link = link_elem.get_attribute('href') or ''
                except:
                    pass
                
                # Validate and add
                if name and name not in [u['name'] for u in universities]:
                    universities.append({
                        'name': name,
                        'location': location,
                        'link': link
                    })
            except Exception as e:
                continue
        
    except Exception as e:
        print(f"      ⚠️  Error scraping universities: {e}")
    
    return universities


def save_university(uni_data):
    """Save university to MongoDB"""
    global total_scraped
    
    try:
        # Validate data
        if not uni_data or not uni_data.get('name'):
            print(f"      ⚠️  Invalid university data, skipping...")
            return
        # Parse location - extract city and province
        location = uni_data.get('location', '')
        city = location.split(',')[0].strip() if location else 'Unknown'
        
        # Better city/province mapping
        city_province_map = {
            'Islamabad': 'Islamabad Capital Territory',
            'Rawalpindi': 'Punjab',
            'Lahore': 'Punjab',
            'Karachi': 'Sindh',
            'Peshawar': 'Khyber Pakhtunkhwa',
            'Quetta': 'Balochistan',
            'Faisalabad': 'Punjab',
            'Multan': 'Punjab',
            'Gujranwala': 'Punjab'
        }
        
        # Determine province from city
        province = 'Unknown'
        for city_name, prov in city_province_map.items():
            if city_name.lower() in city.lower() or city_name.lower() in location.lower():
                city = city_name  # Normalize city name
                province = prov
                break
        
        # If still unknown, try to extract from location string
        if province == 'Unknown' and location:
            location_lower = location.lower()
            if 'punjab' in location_lower or 'lahore' in location_lower or 'rawalpindi' in location_lower:
                province = 'Punjab'
            elif 'sindh' in location_lower or 'karachi' in location_lower:
                province = 'Sindh'
            elif 'khyber' in location_lower or 'peshawar' in location_lower:
                province = 'Khyber Pakhtunkhwa'
            elif 'islamabad' in location_lower:
                province = 'Islamabad Capital Territory'
                city = 'Islamabad'
        
        # Check if exists in database
        try:
            existing = universities_collection.find_one({'name': uni_data['name']})
            
            if existing:
                # Update if needed
                if uni_data.get('link') and not existing.get('website'):
                    universities_collection.update_one(
                        {'name': uni_data['name']},
                        {'$set': {'website': uni_data['link']}}
                    )
                print(f"      ℹ️  Already exists: {uni_data['name']}")
                return
        except Exception as e:
            print(f"      ⚠️  Error checking existing: {e}")
            # Continue to save anyway
        
        # Determine type from sector (if available in name or we can infer)
        uni_type = 'Public'  # Default
        uni_name_lower = uni_data['name'].lower()
        if 'private' in uni_name_lower or 'private' in location.lower():
            uni_type = 'Private'
        
        # Create new
        university = {
            'name': uni_data['name'],
            'city': city if city != 'Unknown' else (location.split(',')[0].strip() if location else 'Unknown'),
            'type': uni_type,
            'website': uni_data.get('link', ''),
            'description': f"HEC Recognized University located in {location or city}"
        }
        
        # Insert into database
        result = universities_collection.insert_one(university)
        if result.inserted_id:
            total_scraped += 1
            print(f"      ✅ Saved: {uni_data['name']} ({city}) [ID: {result.inserted_id}]")
        else:
            print(f"      ⚠️  Insert returned no ID for: {uni_data['name']}")
        
    except Exception as e:
        error_msg = str(e).lower()
        if 'duplicate' in error_msg or 'e11000' in error_msg:
            # Duplicate key error - already exists, that's fine
            return
        else:
            print(f"      ❌ Error saving {uni_data.get('name', 'Unknown')}: {e}")
            import traceback
            traceback.print_exc()


def main():
    """Main scraping function"""
    global total_combinations, current_combination
    
    print("🚀 Starting HEC University Scraping with Python/Selenium...\n")
    
    driver = setup_driver()
    
    try:
        # Navigate to HEC website with retries
        print("📄 Navigating to HEC website...")
        print("⏳ This may take 60-120 seconds, please wait...\n")
        
        # Load page with retry mechanism
        print("   Loading page (this may take 60-90 seconds)...")
        page_loaded = False
        for attempt in range(2):
            try:
                driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
                page_loaded = True
                print("   ✅ Page loaded!")
                break
            except TimeoutException:
                if attempt == 0:
                    print("   ⚠️  Timeout, but page might have loaded. Continuing...")
                    page_loaded = True
                    break
                else:
                    raise
            except Exception as e:
                if attempt == 0:
                    print(f"   ⚠️  Error: {str(e)[:50]}, retrying...")
                    time.sleep(3)
                else:
                    raise
        
        # Wait for page elements to be available
        print("   ⏳ Waiting for page elements to load (10 seconds)...")
        time.sleep(10)  # Give time for dynamic content
        
        # Extract filter options
        filters = extract_filter_options(driver)
        
        print(f"\n📊 Filter Options Found:")
        print(f"   Sector: {len(filters['sectors'])} options")
        print(f"   Chartered By: {len(filters['chartered_by'])} options")
        print(f"   Discipline: {len(filters['disciplines'])} options")
        print(f"   Province: {len(filters['provinces'])} options")
        print(f"   City: {len(filters['cities'])} options\n")
        
        # OPTIMIZATION: Use only specific filters as requested
        # Provinces: Punjab, Sindh, Khyber Pakhtunkhwa, Islamabad
        # Cities: Islamabad, Rawalpindi, Karachi, Lahore, Peshawar
        # Sectors: Both (Public, Private)
        # Disciplines: All
        # Chartered By: All
        
        target_provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Islamabad Capital Territory']
        target_cities = ['Islamabad', 'Rawalpindi', 'Karachi', 'Lahore', 'Peshawar']
        sectors = [s for s in filters['sectors'] if s != 'Select All'] or ['Public', 'Private']
        chartered_by_list = [c for c in filters['chartered_by'] if c != 'Select All'] or ['Select All']
        disciplines = [d for d in filters['disciplines'] if d != 'Select All'] or ['Select All']
        
        # Filter provinces and cities to match only target values
        provinces = [p for p in filters['provinces'] if any(target in p for target in target_provinces)]
        cities = [c for c in filters['cities'] if c in target_cities]
        
        # If not found, try alternative matching
        if not provinces:
            provinces = target_provinces
        if not cities:
            cities = target_cities
        
        # Calculate total combinations (significantly reduced)
        total_combinations = len(sectors) * len(chartered_by_list) * len(disciplines) * len(provinces) * len(cities)
        
        print(f"\n🎯 LIMITED SCRAPING MODE:")
        print(f"   Provinces: {len(provinces)} ({', '.join(provinces[:3])}...)")
        print(f"   Cities: {len(cities)} ({', '.join(cities)})")
        print(f"   Sectors: {len(sectors)} ({', '.join(sectors)})")
        print(f"   Disciplines: {len(disciplines)}")
        print(f"   Chartered By: {len(chartered_by_list)}")
        print(f"\n📈 Total filter combinations: {total_combinations:,}\n")
        print("🚀 Starting optimized scraping...\n")
        
        # Start from combination 15 (skip first 14)
        START_FROM = 15
        skipped = 0
        
        # Iterate through combinations
        for sector in sectors:
            for chartered_by in chartered_by_list:
                for discipline in disciplines:
                    for province in provinces:
                        for city in cities:
                            current_combination += 1
                            
                            # Skip if all are "Select All" (already covered)
                            if all([sector == 'Select All', chartered_by == 'Select All', 
                                   discipline == 'Select All', province == 'Select All', city == 'Select All']):
                                continue
                            
                            # Skip first 14 combinations
                            if current_combination < START_FROM:
                                skipped += 1
                                continue
                            
                            print(f"[{current_combination}/{total_combinations}] {sector} | {chartered_by} | {discipline} | {province} | {city}")
                            if skipped > 0:
                                print(f"   ⏭️  Skipped {skipped} combinations, starting from {START_FROM}")
                                skipped = 0
                            
                            try:
                                # Check if driver is still alive before every operation
                                if not check_driver_alive(driver):
                                    print(f"   ⚠️  Driver connection lost, restarting browser...")
                                    driver = restart_driver(driver)
                                    continue  # Restart this combination
                                
                                # Navigate back to base URL (only if needed)
                                try:
                                    current_url = driver.current_url
                                except Exception as url_error:
                                    if 'HTTPConnectionPool' in str(url_error) or 'Connection' in str(url_error):
                                        print(f"   ⚠️  Connection error getting URL, restarting...")
                                        driver = restart_driver(driver)
                                        continue
                                    raise
                                
                                if 'recognised.aspx' not in current_url:
                                    try:
                                        if not check_driver_alive(driver):
                                            driver = restart_driver(driver)
                                            continue
                                        driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
                                        time.sleep(3)
                                    except Exception as nav_error:
                                        error_str = str(nav_error)
                                        if 'HTTPConnectionPool' in error_str or 'Connection' in error_str or 'ConnectionResetError' in error_str:
                                            print(f"   ⚠️  Connection error, restarting browser...")
                                            driver = restart_driver(driver)
                                            continue
                                        time.sleep(3)
                                else:
                                    # Refresh page to reset filters - but use JavaScript to avoid timeout
                                    try:
                                        if not check_driver_alive(driver):
                                            driver = restart_driver(driver)
                                            continue
                                        driver.execute_script("location.reload();")
                                        time.sleep(3)
                                    except Exception as refresh_error:
                                        error_str = str(refresh_error)
                                        if 'HTTPConnectionPool' in error_str or 'Connection' in error_str or 'ConnectionResetError' in error_str:
                                            print(f"   ⚠️  Connection error on refresh, restarting browser...")
                                            driver = restart_driver(driver)
                                            continue
                                        try:
                                            if not check_driver_alive(driver):
                                                driver = restart_driver(driver)
                                                continue
                                            driver.refresh()
                                            time.sleep(3)
                                        except:
                                            if not check_driver_alive(driver):
                                                driver = restart_driver(driver)
                                                continue
                                            driver.get('https://www.hec.gov.pk/english/universities/Pages/recognised.aspx')
                                            time.sleep(3)
                                
                                # Wait for page to be ready
                                try:
                                    WebDriverWait(driver, 10).until(
                                        lambda d: d.execute_script('return document.readyState') == 'complete'
                                    )
                                except:
                                    time.sleep(2)
                                
                                # Apply filters using JavaScript (avoids timeout)
                                filters_applied = 0
                                
                                # Use JavaScript to apply filters (much faster, no timeout)
                                try:
                                    # Check driver before executing script
                                    if not check_driver_alive(driver):
                                        print(f"   ⚠️  Driver lost before filter, restarting...")
                                        driver = restart_driver(driver)
                                        continue
                                    
                                    driver.execute_script(f"""
                                        var select = document.getElementById('Sector');
                                        if (select) {{
                                            for (var i = 0; i < select.options.length; i++) {{
                                                if (select.options[i].text.trim() === '{sector}') {{
                                                    select.value = select.options[i].value;
                                                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                                    break;
                                                }}
                                            }}
                                        }}
                                    """)
                                    filters_applied += 1
                                    time.sleep(0.5)
                                except Exception as e:
                                    error_str = str(e)
                                    if 'HTTPConnectionPool' in error_str or 'Connection' in error_str or 'ConnectionResetError' in error_str:
                                        print(f"   ⚠️  Connection error in filter, restarting...")
                                        driver = restart_driver(driver)
                                        continue
                                    print(f"      ⚠️  Sector filter error: {error_str[:40]}")
                                
                                try:
                                    if chartered_by != 'Select All':
                                        driver.execute_script(f"""
                                            var select = document.getElementById('Charter');
                                            if (select) {{
                                                for (var i = 0; i < select.options.length; i++) {{
                                                    if (select.options[i].text.trim() === '{chartered_by}') {{
                                                        select.value = select.options[i].value;
                                                        select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                                        break;
                                                    }}
                                                }}
                                            }}
                                        """)
                                        filters_applied += 1
                                    time.sleep(0.5)
                                except:
                                    pass
                                
                                try:
                                    if discipline != 'Select All':
                                        driver.execute_script(f"""
                                            var select = document.getElementById('Disc');
                                            if (select) {{
                                                for (var i = 0; i < select.options.length; i++) {{
                                                    if (select.options[i].text.trim() === '{discipline}') {{
                                                        select.value = select.options[i].value;
                                                        select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                                        break;
                                                    }}
                                                }}
                                            }}
                                        """)
                                        filters_applied += 1
                                    time.sleep(0.5)
                                except:
                                    pass
                                
                                try:
                                    driver.execute_script(f"""
                                        var select = document.getElementById('Province');
                                        if (select) {{
                                            for (var i = 0; i < select.options.length; i++) {{
                                                if (select.options[i].text.trim() === '{province}') {{
                                                    select.value = select.options[i].value;
                                                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                                    break;
                                                }}
                                            }}
                                        }}
                                    """)
                                    filters_applied += 1
                                    time.sleep(0.5)
                                except Exception as e:
                                    print(f"      ⚠️  Province filter error: {str(e)[:40]}")
                                
                                try:
                                    driver.execute_script(f"""
                                        var select = document.getElementById('City');
                                        if (select) {{
                                            for (var i = 0; i < select.options.length; i++) {{
                                                if (select.options[i].text.trim() === '{city}') {{
                                                    select.value = select.options[i].value;
                                                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                                    break;
                                                }}
                                            }}
                                        }}
                                    """)
                                    filters_applied += 1
                                except Exception as e:
                                    print(f"      ⚠️  City filter error: {str(e)[:40]}")
                                
                                print(f"   ✅ Applied {filters_applied} filters")
                                
                                # Wait for results with better detection
                                # First wait a bit for page to process filters (increased wait)
                                time.sleep(2.0)  # Increased from 1.0 to 2.0
                                
                                results_loaded = False
                                # Try multiple detection methods
                                for attempt in range(8):  # Increased attempts
                                    try:
                                        # Method 1: Check for li elements with universities
                                        test_elements = driver.find_elements(By.XPATH, "//li[contains(text(), 'University') or contains(text(), 'Institute') or contains(text(), 'College')]")
                                        if test_elements and len(test_elements) > 0:
                                            results_loaded = True
                                            break
                                        
                                        # Method 2: Check for any list items
                                        all_lis = driver.find_elements(By.XPATH, "//li")
                                        if all_lis:
                                            # Check if any contain university keywords
                                            for li in all_lis[:10]:  # Check first 10
                                                if 'University' in li.text or 'Institute' in li.text:
                                                    results_loaded = True
                                                    break
                                            if results_loaded:
                                                break
                                        
                                        # Method 3: Check for divs with university text
                                        divs = driver.find_elements(By.XPATH, "//div[contains(text(), 'University') or contains(text(), 'Institute')]")
                                        if divs and len(divs) > 2:  # More than just headers
                                            results_loaded = True
                                            break
                                            
                                    except Exception as e:
                                        pass
                                    
                                    time.sleep(0.5)  # Wait between attempts
                                
                                if not results_loaded:
                                    print(f"   ⚠️  No results detected after waiting, trying to scrape anyway...")
                                    # Debug: Check what's on page
                                    try:
                                        page_text = driver.find_element(By.TAG_NAME, 'body').text[:200]
                                        print(f"   🔍 Page preview: {page_text}...")
                                    except:
                                        pass
                                    # Don't skip - try scraping anyway, might still find data
                                
                                # Additional delay for dynamic content to fully load
                                time.sleep(1.5)  # Increased wait time for better results
                                
                                # Scrape universities
                                universities = scrape_universities_from_page(driver)
                                
                                # Debug output
                                if not universities:
                                    print(f"   🔍 Debug: Checking page structure...")
                                    try:
                                        all_lis = driver.find_elements(By.XPATH, "//li")
                                        print(f"   📊 Found {len(all_lis)} list items on page")
                                        if all_lis:
                                            print(f"   📝 First 3 items: {[li.text[:50] for li in all_lis[:3]]}")
                                    except:
                                        pass
                                
                                if universities:
                                    print(f"   ✅ Found {len(universities)} universities")
                                    # Debug: Show all university names
                                    print(f"   📝 Universities found:")
                                    for idx, uni in enumerate(universities[:5], 1):
                                        print(f"      {idx}. {uni.get('name', 'No name')[:60]}")
                                    if len(universities) > 5:
                                        print(f"      ... and {len(universities) - 5} more")
                                    
                                    # Save universities
                                    saved_count = 0
                                    error_count = 0
                                    duplicate_count = 0
                                    
                                    for uni in universities:
                                        try:
                                            uni_name = uni.get('name', '').strip()
                                            if not uni_name:
                                                print(f"   ⚠️  Skipping: Empty name")
                                                continue
                                            
                                            # Check if already in set
                                            if uni_name in scraped_universities:
                                                duplicate_count += 1
                                                continue
                                            
                                            # Check if already in database
                                            existing = universities_collection.find_one({'name': uni_name})
                                            if existing:
                                                duplicate_count += 1
                                                scraped_universities.add(uni_name)
                                                continue
                                            
                                            # Save new university
                                            print(f"   💾 Attempting to save: {uni_name[:50]}...")
                                            scraped_universities.add(uni_name)
                                            save_university(uni)
                                            saved_count += 1
                                            
                                        except Exception as e:
                                            error_count += 1
                                            print(f"   ❌ Error processing {uni.get('name', 'Unknown')[:50]}: {str(e)[:100]}")
                                            import traceback
                                            traceback.print_exc()
                                    
                                    # Summary
                                    print(f"\n   📊 Summary:")
                                    if saved_count > 0:
                                        print(f"      ✅ Saved: {saved_count} new universities")
                                    if duplicate_count > 0:
                                        print(f"      ℹ️  Duplicates: {duplicate_count} (already in database)")
                                    if error_count > 0:
                                        print(f"      ❌ Errors: {error_count}")
                                    if saved_count == 0 and duplicate_count == 0 and error_count == 0:
                                        print(f"      ⚠️  No universities were processed!")
                                else:
                                    print(f"   ⚠️  No universities found for this combination")
                                
                                # Progress update (every 3 combinations for faster feedback)
                                if current_combination % 3 == 0:
                                    print(f"\n📊 Progress: {current_combination}/{total_combinations} ({current_combination/total_combinations*100:.1f}%) | Unique: {len(scraped_universities)} | Saved: {total_scraped}\n")
                                
                            except TimeoutException as e:
                                print(f"   ⚠️  Timeout error occurred, but trying to scrape anyway...")
                                # CRITICAL: Even on timeout, try to scrape - page might have loaded
                                try:
                                    time.sleep(2)  # Small wait
                                    universities = scrape_universities_from_page(driver)
                                    if universities:
                                        print(f"   ✅ Found {len(universities)} universities despite timeout!")
                                        # Save universities
                                        saved_count = 0
                                        error_count = 0
                                        duplicate_count = 0
                                        
                                        for uni in universities:
                                            try:
                                                uni_name = uni.get('name', '').strip()
                                                if not uni_name:
                                                    continue
                                                
                                                if uni_name in scraped_universities:
                                                    duplicate_count += 1
                                                    continue
                                                
                                                existing = universities_collection.find_one({'name': uni_name})
                                                if existing:
                                                    duplicate_count += 1
                                                    scraped_universities.add(uni_name)
                                                    continue
                                                
                                                print(f"   💾 Saving: {uni_name[:50]}...")
                                                scraped_universities.add(uni_name)
                                                save_university(uni)
                                                saved_count += 1
                                            except Exception as save_error:
                                                error_count += 1
                                                print(f"   ❌ Save error: {str(save_error)[:50]}")
                                        
                                        if saved_count > 0:
                                            print(f"   ✅ Saved {saved_count} new universities!")
                                        if duplicate_count > 0:
                                            print(f"   ℹ️  {duplicate_count} duplicates skipped")
                                        if error_count > 0:
                                            print(f"   ⚠️  {error_count} errors occurred")
                                except Exception as scrape_error:
                                    print(f"   ❌ Could not scrape after timeout: {str(scrape_error)[:50]}")
                                # Continue to next combination
                                continue
                            except Exception as e:
                                error_msg = str(e)
                                
                                # Handle connection errors - restart browser
                                if 'HTTPConnectionPool' in error_msg or 'Connection' in error_msg or 'ConnectionResetError' in error_msg:
                                    print(f"   ⚠️  Browser connection lost, restarting...")
                                    try:
                                        driver = restart_driver(driver)
                                        print(f"   ✅ Browser restarted, retrying combination {current_combination}...")
                                        # Retry this combination
                                        current_combination -= 1
                                        continue
                                    except Exception as restart_error:
                                        print(f"   ❌ Could not restart browser: {str(restart_error)[:50]}, skipping...")
                                        continue
                                
                                # Don't show full stacktrace for timeout errors
                                if 'timeout' in error_msg.lower():
                                    print(f"   ⚠️  Timeout error, skipping this combination...")
                                else:
                                    print(f"   ❌ Error: {error_msg[:80]}")
                                # Continue to next combination
                                continue
        
        print("\n\n✅ Scraping Complete!")
        print(f"📊 Total Combinations Processed: {current_combination}")
        print(f"🎓 Total Universities Scraped: {total_scraped}")
        print(f"📝 Unique Universities Found: {len(scraped_universities)}")
        
    except Exception as e:
        print(f"\n❌ Scraping Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        print("\n⏳ Closing browser in 5 seconds...")
        time.sleep(5)
        driver.quit()
        client.close()
        print("👋 Browser closed. Database connection closed.")


if __name__ == '__main__':
    main()

