import pandas as pd
import csv
# 讀取CSV檔案
df = pd.read_csv('Allcsv.csv')

# 定義轉換函數
def transform_row(row):
    return f"{{ category: '{row['category']}', img: '{row['img_url']}', id: '{row['product_id']}', name: '{row['product_name']}', price: {row['price']} }},"

# 應用轉換函數到每一行
df['transformed'] = df.apply(transform_row, axis=1)

# 選擇需要的列保存到新的CSV檔案  Ctrl+F Ctrl+H Replace all
df[['transformed']].to_csv('New_Allcsv.csv', index=False, header=False, quoting=csv.QUOTE_NONE, escapechar='\\')

print("資料已轉換並保存到新的CSV檔案中。")
