import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TribeSellerTutorial = () => {
  const tutorialSteps = [
    {
        title: "1. 申請賣家",
        description: "• 首次上架商品時，需要點擊右上角的設定紐來設定出貨商品放置地\n• 設定完後上架商品的按鈕才可點擊",
        image: "/tribeSellerTutorial/1.png"
    },
    {
        title: "2. 設定出貨商品放置地",
        description: "• 點擊更改資訊的按鈕後，即可選擇出貨商品放置地\n• 設定完成後點擊儲存鈕",
        image: "/tribeSellerTutorial/2.png"
    },
    {
        title: "3. 上架商品",
        description: "• 點擊新增商品的按鈕",
        image: "/tribeSellerTutorial/4.png"
    },
    {
        title: "4. 填入商品相關資訊",
        description: "• 請確認填寫的資訊無誤再上傳",
        image: "/tribeSellerTutorial/5.png"
    },
    {
        title: "5. 等待商品上傳",
        description: "• 請等待商品上傳完成後再關閉頁面",
        image: "/tribeSellerTutorial/6.png"
    },
    {
        title: "6. 我的架上商品",
        description: "• 可在我的架上商品頁面查看目前正在架上的商品",
        image: "/tribeSellerTutorial/7.png"
    },
    {
        title: "7. 查看上架商品詳細資訊-1",
        description: "• 可點選查看按鈕，查看商品的詳細資訊",
        image: "/tribeSellerTutorial/8.png"
    },
    {
      title: "8. 查看上架商品詳細資訊-2",
      description: "• 往左滑動可以查看更多資訊",
      image: "/tribeSellerTutorial/9.png"
    },
    {
      title: "9. 勾選已放置出貨地的商品",
      description: "• 將已送達出貨地的訂單作勾選\n• 確認無誤後點選確認已放置司機拿取地的訂單購選無誤",
      image: "/tribeSellerTutorial/10.png"
    },
    {
      title: "10. 勾選完成頁面",
      description: "• 請確認已送達之後再勾選，點擊確認按鈕後就無法再次更改",
      image: "/tribeSellerTutorial/11.png"
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600 mb-2">部落賣家完整使用教學</h1>
        <p className="text-gray-600 font-bold">完整上架與查看商品指南</p>
      </div>
      
      <Card className="bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-green-600 mb-2">使用提醒</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• 請定時查看司機能運送的時間</li>
            <li>• 請記得勾選已放置至出貨地的訂單</li>
            <li>• 請檢查出貨商品放置地是否正確(於右上角的設定中查看)</li>
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

export default TribeSellerTutorial;