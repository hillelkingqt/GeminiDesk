
import os
from playwright.sync_api import sync_playwright, expect

def verify_settings_version(page):
    # Construct the file path to html/settings.html
    # Adjust the path based on where you run the script from
    cwd = os.getcwd()
    file_path = f"file://{cwd}/html/settings.html"
    print(f"Navigating to: {file_path}")

    page.goto(file_path)

    # Wait for the element to be present
    # Note: In browser mode without electronAPI, the text might be "Loading..." or "App Version"
    # We just want to verify the label exists and the layout is correct.

    # Check for "General" section to make sure page loaded
    general_section = page.get_by_text("General")
    expect(general_section).to_be_visible()

    # Check for "App Version" label
    app_version_label = page.get_by_text("App Version")
    expect(app_version_label).to_be_visible()

    # Check for the version display span
    # It might say "Loading..." since electronAPI is missing
    version_display = page.locator("#app-version-display")
    expect(version_display).to_be_visible()

    print("Found 'App Version' label and display element.")

    # Take a screenshot
    screenshot_path = "/home/jules/verification/settings_version_verification.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_settings_version(page)
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
