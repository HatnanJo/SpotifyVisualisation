from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/SpotifyVisualisation/")

    # Upload the sample data file
    with page.expect_file_chooser() as fc_info:
        page.locator('label.file-label').click()
    file_chooser = fc_info.value
    file_chooser.set_files("jules-scratch/verification/sample_data.json")

    # Wait for the dashboard to be visible
    page.wait_for_selector("div.container h2", timeout=10000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
