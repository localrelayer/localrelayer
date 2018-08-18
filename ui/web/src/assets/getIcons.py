import json
import os.path
from bs4 import BeautifulSoup as bs
import urllib.request
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

options = webdriver.ChromeOptions()
options.add_argument('headless')
try:
  browser = webdriver.Chrome(chrome_options=options)
except:
  print('WTF')
  browser = webdriver.Chrome()
# Find the search box

with open(os.path.dirname(__file__) + '/../../../core/src/api/seeds/tokens.json') as json_data:
    tokens = json.load(json_data)
    for t in tokens:
      browser.get('https://coinmarketcap.com/')
      elem = browser.find_elements_by_class_name('js-quick-search')[1]
      elem.clear()
      elem.send_keys(t['name'])
      elem.send_keys(Keys.RETURN)

      html = browser.page_source

      soup = bs(html, 'html.parser')
      for img in soup.findAll('img', {'class': 'currency-logo-32x32'}):
        image = img['src'].replace('32x32', '64x64')
        print(t['name'], image)
        filename, file_extension = os.path.splitext(os.path.basename(image))
        urllib.request.urlretrieve(image, f"{os.path.dirname(__file__)}/images/{t['symbol']}{file_extension}")

browser.quit()
