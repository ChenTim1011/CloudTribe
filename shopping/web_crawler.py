import requests
from bs4 import BeautifulSoup
from jinja2 import Template
import csv

# 寫入 CSV 文件
def write_to_csv(data, filename='products.csv'):
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['category', 'img_url', 'product_id', 'product_name', 'price'])
        writer.writeheader()
        for item in data:
            writer.writerow(item)

def scrape_data(url):
    response = requests.get(url)
    response.raise_for_status()  # 檢查請求是否成功
    soup = BeautifulSoup(response.text, 'html.parser')
    
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
#put your url here
url = 'https://online.carrefour.com.tw/zh/%E7%94%9F%E9%AE%AE%E5%86%B7%E5%87%8D/%E8%94%AC%E8%8F%9C%E6%B0%B4%E6%9E%9C%E8%BE%B2%E7%89%B9%E7%94%A2/%E5%90%84%E5%BC%8F%E8%94%AC%E8%8F%9C'
data = scrape_data(url)

write_to_csv(data)

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
with open('output.html', 'a', encoding='utf-8') as file:
    file.write(rendered_html)
