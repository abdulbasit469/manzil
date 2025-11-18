@echo off
echo ========================================
echo   FAST HEC University Scraper
echo ========================================
echo.
echo This will scrape ALL universities at once
echo (Much faster than iterating through all combinations)
echo.
echo Installing dependencies if needed...
pip install -r requirements.txt
echo.
echo Starting FAST scraper...
python scrape_hec_universities_fast.py
pause

