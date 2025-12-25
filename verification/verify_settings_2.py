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

        # Check for Auto-copy label (since input is hidden)
        auto_copy_label = page.get_by_text("Auto-copy AI Response")
        if auto_copy_label.is_visible():
            print("✅ Auto-copy label found and visible")
        else:
            print("❌ Auto-copy label NOT found or visible")

        # Check for Danger Zone
        danger_zone = page.locator(".setting-category.danger-zone")
        if danger_zone.is_visible():
            print("✅ Danger Zone class found")
        else:
            print("❌ Danger Zone class NOT found")

        # Scroll to bottom to see Danger Zone
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

        # Take screenshot
        screenshot_path = os.path.join(cwd, "verification", "settings_verification_2.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
