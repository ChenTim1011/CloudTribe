import requests
from bs4 import BeautifulSoup
from jinja2 import Template
import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

# 初始化 Chrome 驅動
chrome_options = Options()
chrome_options.add_argument("--disable-notifications")
driver = webdriver.Chrome(options=chrome_options)

# 打開目標網站
url = 'https://online.carrefour.com.tw/zh/homepage/'
driver.get(url)
time.sleep(3)

wait = WebDriverWait(driver, 10)

# 嘗試關閉彈出窗口
try:
    popup_button = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="close-button-1454703513202"]')))
    popup_button.click()
    print("Popup closed.")
except Exception as e:
    print(f"No popup to close or error occurred: {e}")

# 進入目標頁面
try:
    enter_page = driver.find_element(By.XPATH, '/html/body/div[3]/section/div[3]/div[1]/div[2]/a[9]')
    enter_page.click()
    print("Entered target page.")
    enter = driver.find_element(By.XPATH, '/html/body/div[3]/section/section/div/div[1]/ul/li[4]/p/a')
    enter.click()
    print("Entered inner page.")
except Exception as e:
    print(f"Error navigating to the target page: {e}")

# 檢查下一頁是否可用
def next_page_available(driver):
    try:
        next_button = driver.find_element(By.XPATH, '//a[img[@alt="next"]]')
        return True
    except Exception as e:
        print(f"Error checking next page availability: {e}")
        return False

# 寫入 CSV 文件
def write_to_csv(data, filename='camp.csv'):
    with open(filename, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['category', 'img_url', 'product_id', 'product_name', 'price'])
        writer.writeheader()
        for item in data:
            writer.writerow(item)

# 爬取數據
def scrape_data(driver):
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    data = []
    items = soup.find_all('div', class_='hot-recommend-item line')
    
    for item in items:
        try:
            product_link = item.find('a', class_='gtm-product-alink')
            full_category = product_link['data-category']
            category_parts = full_category.split('/')
            
            if len(category_parts) >= 3:
                category = category_parts[-2]  # get the second last part
            else:
                category = category_parts[-1]  # if there are less than 3 parts, get the last part
                
            img_url = product_link.find('img')['src']
            product_id = product_link['data-pid']
            product_name = product_link['data-name']
            price = product_link['data-price']
            
            data.append({
                'category': category,
                'img_url': img_url,
                'product_id': product_id,
                'product_name': product_name,
                'price': price
            })
        except AttributeError as e:
            # 如果任何步驟失敗，繼續下一個 item
            print(f"Error processing item: {e}")
            continue
    
    return data

# 檢查頁面是否已更新到下一頁
def page_updated(driver, current_page_source):
    new_page_source = driver.page_source
    return new_page_source != current_page_source

# 爬取循環
while True:
    try:
        # 每次操作前檢查並嘗試關閉彈出窗口
        try:
            popup_button = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="close-button-1454703513202"]')))
            popup_button.click()
            print("Popup closed.")
            popup = wait.until(EC.presence_of_element_located((By.XPATH, '/html/body/div[8]/div[2]/div[2]/button/div')))
            popup.click()
            
        except Exception as e:
            print(f"No popup to close or error occurred: {e}")

        # 爬取數據
        data = scrape_data(driver)
        if data:
            write_to_csv(data)
            print("Data successfully written to CSV.")
            template_str = '''
            {% for item in data %}
            <div class="item fm_{{ item.category }}">
                <div class="box-img">
                    <img src="{{ item.img_url }}" alt="{{ item.product_name }}">
                </div>
                <div class="description">
                    {{ item.product_name }}
                </div>
                <div class="price">
                    售價: ${{ item.price }}/個
                </div>
                <div class="order">
                    數量：<input type="number" id="quantity-{{ item.product_id }}" min="1" value="1"><br>
                    <button onclick="addToCart('{{ item.product_id }}', '{{ item.product_name }}', '{{ item.price }}')"><i class="fas fa-shopping-cart"></i>購物車</button>
                </div>
            </div>
            {% endfor %}
            '''

            template = Template(template_str)
            rendered_html = template.render(data=data)
            with open('camp.html', 'a', encoding='utf-8') as file:
                file.write(rendered_html)

        else:
            print("No data found on this page.")

        # 檢查並點擊下一頁按鈕
        if next_page_available(driver):
            current_page_source = driver.page_source
            retries = 0
            max_retries = 100
            while retries < max_retries:
                try:
                    next_button = driver.find_element(By.XPATH, '//a[img[@alt="next"]]')
                    next_button.click()
                    print("Clicked next page button.")
                    time.sleep(1)  # 等待頁面加載
                    if page_updated(driver, current_page_source):
                        print("Navigated to next page.")
                        break
                    else:
                        retries += 1
                        print(f"Retrying to click next page button: {retries}/{max_retries}")
                except Exception as e:
                    print(f"Error clicking next page button: {e}")
                    retries += 1
            if retries == max_retries:
                print("Failed to navigate to next page after multiple attempts.")
                break
        else:
            print("No more pages available.")
            break
    except Exception as e:
        print(f"Error in scraping loop: {e}")
        break

driver.quit()
print("Scraping finished.")
