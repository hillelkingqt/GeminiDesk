from playwright.sync_api import sync_playwright
import os

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local file
        file_path = f"file://{os.path.abspath('html/deep-research-schedule.html')}"
        page.goto(file_path)

        # Take a screenshot
        page.screenshot(path="verification/deep_research_schedule.png")
        print("Screenshot saved to verification/deep_research_schedule.png")

        # Also verify mcp-setup.html since I updated CSS for it implicitly via shared CSS
        file_path_mcp = f"file://{os.path.abspath('html/mcp-setup.html')}"
        page.goto(file_path_mcp)
        page.screenshot(path="verification/mcp_setup.png")
        print("Screenshot saved to verification/mcp_setup.png")

        browser.close()

if __name__ == "__main__":
    verify_ui()
