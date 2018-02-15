var puppeteer = require("puppeteer");

puppeteer.launch().then(
    async (browser) => {
        const page = await browser.newPage();
        const url = "https://www.dr.dk";
        await page.tracing.start({ path: "./pup-test.json" });
        await page.goto(url);
        await page.tracing.stop();
        await page.on("load", () => console.log("done"));
        await browser.close();
    }
)
