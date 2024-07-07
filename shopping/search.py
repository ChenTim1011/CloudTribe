# search.py
import requests
from bs4 import BeautifulSoup

def search_products(keyword):
    url = f"https://online.carrefour.com.tw/zh/search?q={keyword}"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    products = []
    for item in soup.find_all("div", class_="product-item"):
        title = item.find("h2").text
        price = item.find("span", class_="price").text
        link = item.find("a")["href"]
        products.append({"title": title, "price": price, "link": link})
    
    return products
