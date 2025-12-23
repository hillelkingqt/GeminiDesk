from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        cwd = os.getcwd()
        settings_path = f"file://{cwd}/html/settings.html"
        page.goto(settings_path)

        # Type in the search bar
        print("Typing 'theme'...")
        page.fill('#settings-search-input', 'theme')

        # Wait a bit
        page.wait_for_timeout(1000)

        # Check visibility of categories
        categories = page.query_selector_all('.setting-category')
        for i, cat in enumerate(categories):
            title_el = cat.query_selector('.setting-category-title')
            title = title_el.inner_text if title_el else "Unknown"
            display = cat.evaluate("el => el.style.display")
            print(f"Category '{title}': display='{display}'")

        page.screenshot(path="verification/settings_filtered_debug.png")

        browser.close()

if __name__ == "__main__":
    run()
