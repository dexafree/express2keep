const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const noderus = require('noderus');

const LIST_ID = process.env['LIST_ID'];
const LOGIN_URL = `https://accounts.google.com/signin/v2/identifier?passive=1209600&continue=https%3A%2F%2Fshoppinglist.google.com%2Fu%2F0%2Flists%2F${LIST_ID}&followup=https%3A%2F%2Fshoppinglist.google.com%2Fu%2F0%2Flists%2F${LIST_ID}&flowName=GlifWebSignIn&flowEntry=ServiceLogin`;
const URL = `https://shoppinglist.google.com/u/0/lists/${LIST_ID}`;
const POST_URL = "http://keep:5000/elements";
const COOKIES_FILE = "cookies.json";

const WAIT_UNTIL = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'];
const LOAD_TIMEOUT = 10000;

const timeout = ms => new Promise(res => setTimeout(res, ms));


const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getElements = async (page) => {
    const elements = await page.$$('shopping-list-item');

    noderus.info(`Finished downloading elements. Found ${elements.length}`);

    let texts = [];
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let text = await page.evaluate(item => item.innerText, element);
        let replaced = text.replace('local_mall', '');
        let trimmed = replaced.trim();
        let withFirstUppercase = capitalizeFirstLetter(trimmed);

        texts.push(withFirstUppercase);
    }

    return texts;
};

const deleteElements = async (page) => {
    const elements = await page.$$('[gxvelog="RemoveListItemButton"]');

    await timeout(1000);

    for (let element of elements) {
        await page.evaluate((el) => {
            return el.click()
        }, element);
        await timeout(2000);
    }
};

const downloadCookies = async (page) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('#identifierId');
    await page.type('#identifierId', process.env.EMAIL, {delay: 5});
    await page.click('#identifierNext');
    await page.waitForSelector('#password input[type="password"]', {visible: true});
    await page.type('#password input[type="password"]', process.env.PASS, {delay: 5});
    await page.click('#passwordNext');
    await page.waitFor(3000);
    const cookies = await page.cookies();
    return cookies;
};

const getLocalCookies = async () => {

    try {
        let cookies = require(`./${COOKIES_FILE}`);
        return cookies;
    } catch (e) {
        return null;
    }
};

const saveLocalCookies = async (cookies) => {
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies));
};

const configureCookies = async (page) => {
    let localCookies = await getLocalCookies();
    if (localCookies) {

        noderus.info('Loaded local cookies');

        for (let cookie of localCookies) {
            await page.setCookie(cookie);
        }

        noderus.info('Set local cookies');

    } else {

        noderus.info('Did not find local cookies');

        let cookies = await downloadCookies(page);

        noderus.info('Downloaded cookies');

        await saveLocalCookies(cookies);

        noderus.info('Saved local cookies');
    }
};

const addElementsToKeep = async (elements) => {

    let data = {
        elements: elements
    };

    try {

        noderus.info('Sending request...');

        let response = await axios.post(POST_URL, data);

        let responseBody = response.data;

        noderus.info(`Request sent. Response: [${responseBody}]`);
        if (responseBody === 'OK') {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        noderus.error(e.message);
        return false;
    }

};

const processPage = async (page) => {
    noderus.info('Getting elements...');
    let elements = await getElements(page);
    if (elements.length > 0) {

        noderus.info(`Elements: ${JSON.stringify(elements)}`);

        let success = await addElementsToKeep(elements);
        if (success) {
            noderus.info('Successfully added elements to Keep. Deleting elements...');
            await deleteElements(page);
            noderus.info('Deleted elements from Express');
        }
    }
};

const getPage = async (browser) => {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36');
    await configureCookies(page);

    noderus.info('Configured cookies');

    try {
        noderus.info('Loading page...');
        await page.goto(URL, {
            waitUntil: WAIT_UNTIL,
            timeout: LOAD_TIMEOUT

        });
        noderus.info('Page loaded...');
    } catch (e) {
        noderus.error('Error loading page.');
    }

    return page;
};

const getBrowser = async () => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu'
        ]
    });
    return browser;
};

const main = async () => {
    const browser = await getBrowser();

    noderus.info('Got browser');

    let page;

    while (true) {

        if (!page) {
            page = await getPage(browser);
        }

        if (page != null) {
            noderus.info('Got page');

            await processPage(page);
        }

        await timeout(60 * 1000);

        if (page != null) {
            try {
                await page.reload({waitUntil: WAIT_UNTIL, timeout: LOAD_TIMEOUT})
            } catch (e) {
            }
        }
    }
};

main();
