# HEC University Scraper (Python)

Python-based scraper for HEC recognized universities using Selenium.

## Setup

### 1. Install Python (if not installed)
- Download from: https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### 2. Install Dependencies
```bash
cd scraper
pip install -r requirements.txt
```

### 3. Setup Environment Variables
Create `.env` file in root directory (if not exists):
```
MONGO_URI=mongodb://localhost:27017/manzil
```

## Usage

### Test First (Recommended)
```bash
cd scraper
python test_hec_scraper.py
```

This will:
- Open browser and navigate to HEC website
- Inspect page structure
- Show filter options
- Test university extraction
- Keep browser open for 15 seconds for inspection

### Full Scraping
```bash
cd scraper
python scrape_hec_universities.py
```

This will:
- Automatically iterate through ALL filter combinations
- Scrape universities from each combination
- Save to MongoDB (avoids duplicates)
- Show progress updates

## Features

- ✅ Automatic filter iteration (all combinations)
- ✅ Duplicate detection
- ✅ Progress tracking
- ✅ Error handling (continues on errors)
- ✅ MongoDB integration
- ✅ Auto ChromeDriver installation

## Notes

- First run will download ChromeDriver automatically
- Scraping may take several hours for all combinations
- Browser will be visible (set `headless=True` in script for background)
- Make sure MongoDB is running

## Troubleshooting

**ChromeDriver issues:**
- Script auto-installs ChromeDriver, but if issues occur:
  - Make sure Chrome browser is installed
  - Update Chrome to latest version

**Timeout errors:**
- Increase wait times in script
- Check internet connection
- HEC website might be slow

**MongoDB connection:**
- Make sure MongoDB is running
- Check MONGO_URI in .env file



