from playwright.sync_api import sync_playwright
import os

def run():
    try:
        with sync_playwright() as p:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Navigate to the local settings.html file
            cwd = os.getcwd()
            settings_path = os.path.join(cwd, 'html', 'settings.html')
            url = f'file://{settings_path}'
            print(f"Navigating to {url}")
            page.goto(url)

            # Wait for the page to load
            print("Waiting for selector...")
            page.wait_for_selector('.setting-item')

            # Scroll to the bottom to see the new shortcut
            print("Scrolling...")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

            screenshot_path = os.path.join(cwd, 'verification', 'settings_screenshot.png')
            print(f"Taking screenshot to {screenshot_path}")
            page.screenshot(path=screenshot_path, full_page=True)
            print("Screenshot saved.")
            browser.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    run()
