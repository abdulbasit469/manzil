@echo off
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Running test scraper...
python test_hec_scraper.py
pause



