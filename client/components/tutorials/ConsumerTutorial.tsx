import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ConsumerTutorial = () => {
  const tutorialSteps = [
    {
        title: "1. 進入購買農產品頁面",
        description: "• 進入購買農產品頁面(從上方列頁面導覽做選取)\n• 查看目前正在架上的農產品",
        image: "/ConsumerTutorial/1.png"
    },
    {
        title: "2. 加入購物車",
        description: "• 找到想買的商品\n• 更改購買數量後，就可以點擊黑色加入購物車的按鈕",
        image: "/ConsumerTutorial/2.png"
    },
    {
        title: "3. 填寫購買資訊",
        description: "• 初次購買商品時，須先設定取貨處地點",
        image: "/ConsumerTutorial/3.png"
    },
    {
        title: "4. 設定取貨地點",
        description: "• 查看訂單狀態：點擊右上方設定鈕進入此頁面\n• 點擊更改資訊的按鈕後，即可選擇出貨商品放置地\n• 設定完成後點擊儲存鈕",
        image: "/ConsumerTutorial/4.png"
    },
    {
        title: "5. 購物車",
        description: "• ˇ點擊右上角購物車的按鈕，可以進入購物車",
        image: "/ConsumerTutorial/6.png"
    },
    {
        title: "6. 勾選購買商品",
        description: "• 勾選想購買的商品並點擊右上角購買勾選商品的按鈕",
        image: "/ConsumerTutorial/7.png"
    },
    {
        title: "7. 貸出貨商品",
        description: "• 於待出貨商品頁面查看目前仍處待出貨階段的商品",
        image: "/ConsumerTutorial/8.png"
    },
    {
      title: "8. 查看詳細資訊-1",
      description: "• 點擊查看按鈕，可查看商品更詳細的資訊\n• 此商品的狀態為待出貨",
      image: "/ConsumerTutorial/9.png"
    },
    {
      title: "9. 查看詳細資訊-2",
      description: "• 當有司機接單後，商品狀態就轉為接單",
      image: "/ConsumerTutorial/10.png"
    },
    {
      title: "10. 待收貨商品頁面",
      description: "• 可以於此頁面查看已送達的商品",
      image: "/ConsumerTutorial/11.png"
    }

  ];

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600 mb-2">團購買家完整使用教學</h1>
        <p className="text-gray-600 font-bold">完整購買商品與查看商品資訊指南</p>
      </div>
      
      <Card className="bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-green-600 mb-2">使用提醒</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• 請確實檢查取貨地點正確(於右上角的設定中查看)</li>
            <li>• 請隨時查看是否有已到貨的訂單</li>
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

export default ConsumerTutorial;