from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Determine the absolute path to html/settings.html
        cwd = os.getcwd()
        settings_path = os.path.join(cwd, "html", "settings.html")
        url = f"file://{settings_path}"

        print(f"Navigating to {url}")
        page.goto(url)

        # Wait for the page to load
        page.wait_for_selector(".setting-category", timeout=5000)

        # Check for Auto-copy toggle
        auto_copy = page.locator("#setting-autoCopyResponse")
        if auto_copy.is_visible():
            print("✅ Auto-copy toggle found")
        else:
            print("❌ Auto-copy toggle NOT found")

        # Check for Danger Zone
        danger_zone = page.locator(".setting-category.danger-zone")
        if danger_zone.is_visible():
            print("✅ Danger Zone class found")
            # Check style
            bg_color = danger_zone.evaluate("element => getComputedStyle(element).backgroundColor")
            print(f"Danger Zone Background: {bg_color}")
        else:
            print("❌ Danger Zone class NOT found")

        # Scroll to bottom to see Danger Zone
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

        # Take screenshot
        screenshot_path = os.path.join(cwd, "verification", "settings_verification.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
