from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the settings page directly
        # Adjust path if needed
        file_path = os.path.abspath('html/settings.html')
        page.goto(f'file://{file_path}')

        # Wait for content to load
        page.wait_for_selector('.setting-category')

        # Check if record buttons are visible
        # We look for "Click to record" text or similar
        buttons = page.query_selector_all('.record-button')
        print(f"Found {len(buttons)} record buttons")

        # Take a screenshot
        page.screenshot(path='verification/settings.png', full_page=True)
        browser.close()

if __name__ == "__main__":
    run()
