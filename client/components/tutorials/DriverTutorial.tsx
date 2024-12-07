import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DriverTutorial = () => {
  const tutorialSteps = [
    {
        title: "1. 申請司機",
        description: "• 輸入姓名和電話號碼\n• 點擊確認按鈕完成申請司機\n• 開始接單服務",
        image: "/DriverTutorial/1.png"
    },
    {
        title: "2. 司機專區",
        description: "• 新增時間讓賣家知道司機有空時間\n• 管理訂單可以看到自己接單的詳細資訊\n• 取得未接單表單用來接單",
        image: "/DriverTutorial/4.png"
    },
    {
        title: "3. 設定可接單時段",
        description: "• 告訴賣家司機可以的時間，可以選擇日期和時間(不能比現在時間早)\n• 輸入預計時間到達地點\n• 點擊新增時間確認",
        image: "/DriverTutorial/3.png"
    },
    {
        title: "4. 我的訂單管理",
        description: "• 查看訂單狀態：接單或已完成\n• 檢視訂單的總金額\n• 查看購買者資訊和商品明細\n• 可以確認全部要買的商品數量和總價格",
        image: "/DriverTutorial/5.png"
    },
    {
        title: "5. 未接單訂單",
        description: "• 檢視新訂單的購買資訊\n• 查看配送地點\n• 確認商品清單和總金額\n• 選擇是否接單",
        image: "/DriverTutorial/6.png"
    },
    {
        title: "6. 轉單功能介紹",
        description: "• 沒有棄單設計，必須輸入已存在司機的電話\n• 與對方司機聯絡好確定可以轉單\n• 輸入對方司機電話確認轉單",
        image: "/DriverTutorial/7.png"
    },
    {
        title: "7. 導航路線規劃",
        description: "• 查看目前位置到目的地的地圖\n• 檢視最佳配送路線\n• 確認預計送達時間\n",
        image: "/DriverTutorial/8.png"
    },
    {
        title: "9. 導航系統",
        description: "• 選擇交通方式：汽車、步行或機車\n• 顯示總路程距離和預計時間\n• 查看詳細取貨和配送地點\n• 可新增額外配送點\n• 生成最佳配送路線",
        image: "/DriverTutorial/9.png"
    },
    {
      title: "10. 可以調整想去的地點",
      description: "• 起點終點固定，但是中間點可以自己加\n• 即時顯示總距離和時間，也有各段距離",
      image: "/DriverTutorial/10.png"
    },
    {
      title: "11. 推薦路線",
      description: "• 按下推薦路線自己排序出最短路徑和時間\n• 讓司機知道怎麼走比較快，但按下生成導航連結體驗更好",
      image: "/DriverTutorial/11.png"
    },
    {
      title: "12. 生成導航連結",
      description: "• 直接依照選擇模式和路線，幫你整理好Google 路徑連結\n• 讓 Google 導航告訴要你要怎麼走",
      image: "/DriverTutorial/12.png"
    },
    {
      title: "13. 貨品已到達目的地",
      description: "• 當司機把貨運送到目的地，就可以按下貨品已到達目的地",
      image: "/DriverTutorial/13.png"
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600 mb-2">司機完整使用教學</h1>
        <p className="text-gray-600 font-bold">從申請到完成配送的詳細指南</p>
      </div>
      
      <Card className="bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-green-600 mb-2">使用提醒</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• 請確實檢查訂單資訊和配送地址</li>
            <li>• 接單前評估路程時間和距離</li>
            <li>• 保持聯絡電話暢通，確保溝通順暢</li>
            <li>• 善用路線規劃功能提升配送效率</li>
            <li>• 定期更新可接單時段，維持良好服務品質</li>
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

export default DriverTutorial;