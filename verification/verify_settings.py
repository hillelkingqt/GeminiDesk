from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the settings page directly from file
        cwd = os.getcwd()
        settings_path = f"file://{cwd}/html/settings.html"
        page.goto(settings_path)

        # Take a screenshot of the initial state
        page.screenshot(path="verification/settings_initial.png")

        # Type in the search bar
        page.fill('#settings-search-input', 'theme')

        # Wait for filtering to happen (it's instant but let's wait a bit)
        page.wait_for_timeout(500)

        # Take a screenshot of the filtered state
        page.screenshot(path="verification/settings_filtered.png")

        browser.close()

if __name__ == "__main__":
    run()
