import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TribeBuyerTutorial = () => {
  const tutorialSteps = [
    {
      title: "1. 首頁介面",
      description: "• 使用搜尋欄快速找商品\n• 查看購物車商品\n• 新增想要購買的商品\n• 瀏覽所有商品類別",
      image: "/tribeBuyerTutorial/tutorial1.png"
    },
    {
      title: "2. 我的訂單",
      description: "• 查看目前訂單的狀態和價格\n• 查看訂單詳細的明細\n• 查看訂單的配送狀態",
      image: "/tribeBuyerTutorial/tutorial2.png"
    },
    {
      title: "3. 新增想要購買的商品",
      description: "• 當想要商品搜尋不到可以使用\n• 輸入詳細的商品資訊、數量、價格\n• 地點可以搜尋讓司機知道該商品可以去哪裡購買",
      image: "/tribeBuyerTutorial/tutorial3.png"
    },
    {
      title: "4. 搜尋想要的商品種類",
      description: "• 先挑選大種類之後有個別細項\n• 或是透過搜尋找到想要的商品種類\n• 透過篩選找到符合需求的商品",
      image: "/tribeBuyerTutorial/tutorial4.png"
    },
    {
      title: "5. 商品分類瀏覽",
      description: "• 選擇商品分類\n• 瀏覽分類商品\n• 快速找到需要商品",
      image: "/tribeBuyerTutorial/tutorial5.png"
    },
    {
      title: "6. 商品名稱和價格",
      description: "• 可輸入自己想要購買的數量\n• 按下加入購物車就可以把商品放入購物車\n• 商品連結才能知道目前真正的商品價格以及是否有貨",
      image: "/tribeBuyerTutorial/tutorial6.png"
    },
    {
      title: "7. 點選商品連結",
      description: "• 可以到家樂福官網看目前商品的售價\n• 可以查看的商品資訊\n• 可以看到商品的評價",
      image: "/tribeBuyerTutorial/tutorial7.png"
    },
    {
      title: "8. 購物車結帳",
      description: "• 可以調整購買數量\n• 查看購物車品項以及總金額\n• 確認沒問題就可以點選結帳",
      image: "/tribeBuyerTutorial/tutorial8.png"
    },
    {
      title: "9. 完成訂購",
      description: "• 填寫基本資料後\n• 如果比較緊急可以勾是否緊急\n• 提交訂單等待出貨通知",
      image: "/tribeBuyerTutorial/tutorial9.png"
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600 mb-2">山上買家使用教學</h1>
        <p className="text-gray-600 font-bold">完整購物流程指南</p>
      </div>
      
      <Card className="bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-green-600 mb-2">購物提醒</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• 訂購前請確認商品價格與數量</li>
            <li>• 填寫資料時請確保正確性</li>
            <li>• 配送地址正確填寫</li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {tutorialSteps.map((step, index) => (
          <Card key={index} className="w-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-green-600">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full h-[600px] flex justify-center p-4">
                <img
                  src={step.image}
                  alt={step.title}
                  className="rounded-lg object-contain w-full lg:w-4/5"
                />
              </div>
              <div className="space-y-2 mt-4">
                {step.description.split('\n').map((line, i) => (
                  <p key={i} className="text-gray-600">{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TribeBuyerTutorial;