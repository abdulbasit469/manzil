@echo off
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting full HEC university scraping...
echo This will take a long time. Press Ctrl+C to stop.
echo.
python scrape_hec_universities.py
pause



