# Express2Keep

This project is a hack that makes it possible to add items to a Google Keep shopping list via Google Assistant (and therefore, Google Home devices).

## How does it work

By default, Google Assistant will add the items to a list in Google Express. What this project does is to monitor the Google Express list using a headless browser (that means, without user interface), and when it detects an item, it appends it to a Google Keep note. After the Google Keep part is done, the item is deleted from the Google Express list.

I'm aware that this is a messy implementation, but it has worked for me the past weeks, and I just wanted to open source it in case it's useful for anyone else.

The two parts have been implemented in separated services and in different languages, as they both use already existing technologies and libraries.

## How to use

### Configuration

First of all, run the following command in order to create a config file and to start editing it:

```sh
cp config.env.sample config.env
```

After that, open the newly created `config.env` file and start filling in the details:

* EMAIL: Your email, including the `@gmail.com` part.
* PASS: Your GMail password.
* MAC: Read below.
* DELAY: Refresh interval for checking the Google Express list (in seconds).
* LISTID: Read below.
* NOTE_TITLE: Title of the Google Keep note you want to use as a shopping list. **In case it contains spaces, you do not need to wrap the name withing quotes. Write it as is**.

#### MAC

In order to overcome an issue with the Google Keep sync API, a valid Android ID is required.

You can get the Android ID of your device by following these steps:

1. Get an Android phone with Google Keep installed and with your account logged in.
2. Make sure you have USB debugging enabled.
3. Run `adb shell` in a terminal 
4. Enter one of the commands you can find here: https://stackoverflow.com/a/13647627

The value you get is your Android ID, and it's the value you need to enter in the field.

#### List id

1. Open a browser and access this URL: https://shoppinglist.google.com/u/0/lists/default
2. It will redirect you automatically to your default Google Express list. In case it's not your default list, navigate using the left sidebar to the list you wish to use.
3. Copy the last number in the URL (it should be something like 13323179499829479226). This is your list id.

### Usage

After you have your `config.env` file ready, you can start using it.

This project makes use of docker, in order to make it easier to have a common environment and prevent you from having to mess up with Python versions, NodeJS and what else. 

#### Build the images

As this project deals with sensible credentials, a prebuilt image is not offered, as you would need to trust that the image you are downloading contains the same exact code you can see here. In order to be as transparent as possible, I prefer that you build the images yourself. In order to do that, run the following command:

```bash
docker-compose build
```

#### Running it

In order to run it, you need to run the following command:

```bash
docker-compose up
```

**YOU MAY RECEIVE A NOTIFICATION AND AN EMAIL TELLING YOU THAT A NEW DEVICE HAS ACCESSED YOUR ACCOUNT (Linux Browser). IT'S COMPLETELY NORMAL (it's the headless browser. The IP shown should be the IP of the server/your home).**

Once it's running, try to add an item to the list via Google Assistant (or Google Home).

After the period of time defined in the configuration file, you should see how one of the services detects the change and sends it to the Google Keep service.

If everything works as expected, you can run the project in background with the following command:

```bash
docker-compose up -d
```

### Usage (without docker)

In case you want to run the project yourself without using Docker, you would need to:

1. Export the ENV variables from your `config.env` file to your current shell session.
2. Inside the `python` directory, run `pip install -r requirements.txt`. Then  `python main.py`.
3. Inside the `google-express-getitems` directory, run `yarn install` / `npm install`. Then edit the `POST_URL` variable to point it to the correct endpoint, and finally run `node main.js`.


### Issues

In case you start seeing logs that say things like "BrowserNeededException" or things like that, try visiting this page:

https://accounts.google.com/b/0/DisplayUnlockCaptcha

It should allow the next login attempts to succeed even if they are from an unknown device (until Google accepts that is you who is trying to log in).

## Support

This project only makes use of two third-party libraries/utilities, it does not have any specific code that handles any of the synchronization:

* GKeepApi: https://github.com/kiwiz/gkeepapi
* Puppeteer: https://github.com/GoogleChrome/puppeteer

If you happen to encounter any issue using this project, it will most likely be an issue of the tools used, and not an issue of the project.

