'use client'
import React, { useState } from "react";
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Page() {
  const [isVisible, setIsVisible] = useState(false)
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-slate-100">
      <div className="w-full h-full lg:p-8 p-2">
        <div className="lg:h-96 h-52 relative w-full overflow-hidden bg-green-600 flex flex-col items-center justify-center rounded-xl shadow-2xl transition hover:bg-green-400">
          <div className="absolute inset-0 w-full h-full bg-slate-600 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="lg:text-4xl text-3xl flex flex-col items-center justify-center text-white font-mono lg:text-5xl font-extrabold">
            順 路 經 濟 平 台
          </div>
          <p className="lg:text-lg text-sm text-center lg:mt-2 text-neutral-300 relative z-20 font-mono">
            給 您 最 簡 單 的 購 物 體 驗
          </p>
        </div>

        <div className="p-8 flex flex-row gap-4 items-center justify-center">
          <Button 
            className="lg:h-16 h-12 lg:w-1/4 w-1/2 lg:text-2xl text-md rounded-2xl bg-slate-500 shadow-2xl text-white font-mono hover:bg-slate-400"
            onClick={() => setIsVisible(true)}>
            立即體驗
          </Button>

          <Button className="lg:h-16 h-12 lg:w-1/4 w-1/2 lg:text-2xl text-md rounded-2xl text-mdrounded-2xl bg-slate-300 shadow-2xl font-mono hover:bg-slate-400">
            使用指南
          </Button>
        </div>
        {isVisible &&
        <div className="lg:p-8 flex flex-row gap-2 items-center justify-center">
          <Button 
            className="lg:h-16 h-12 lg:text-2xl text-md rounded-2xl bg-gray-500 shadow-2xl text-white font-mono hover:bg-slate-400">
            <Link href="/tribe_resident/necessities">
              部落居民專區
            </Link>
          </Button>
          <Button className="lg:h-16 h-12 lg:text-2xl text-md rounded-2xl bg-gray-500 shadow-2xl font-mono hover:bg-slate-400">
            <Link href="/buy_agri_produce">
              購買農產品專區
            </Link>
          </Button>
          <Button className="lg:h-16 h-12 lg:text-2xl text-md rounded-2xl bg-gray-500 shadow-2xl font-mono hover:bg-slate-400">
            <Link href="/driver">
              測試司機專區
            </Link>
          </Button>
          <Button className="lg:h-16 h-12 lg:text-2xl text-md rounded-2xl bg-gray-500 shadow-2xl font-mono hover:bg-slate-400">
            <Link href="/buyer">
              測試部落居民專區-購買服務
            </Link>
          </Button>
          <Button className="lg:h-16 h-12 lg:text-2xl text-md rounded-2xl bg-gray-500 shadow-2xl font-mono hover:bg-slate-400">
            <Link href="/viewform">
              測試查看表單
            </Link>
          </Button>
          <Button className="lg:h-16 h-12 lg:text-2xl text-md rounded-2xl bg-gray-500 shadow-2xl font-mono hover:bg-slate-400">
            <Link href="/register">
              測試註冊
            </Link>
          </Button>
        </div>}
      </div>
    </main>
  );
}
