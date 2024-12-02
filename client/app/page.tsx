'use client';
import React, { useState } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import TribeBuyerTutorial from '@/components/tutorials/TribeBuyerTutorial';
import DriverTutorial from '@/components/tutorials/DriverTutorial';

// Define the main section types
type MainSection = 'experience' | 'guide' | null;

// Define the guide sub-section types
type GuideSection = 'guideText' | 'guideVideo' | null;

// Define role types
type Role = 'seller' | 'driver' | 'tribebuyer' | 'buyer' | null;

export default function Page() {
  const [mainSection, setMainSection] = useState<MainSection>(null);
  const [guideSection, setGuideSection] = useState<GuideSection>(null);
  const [role, setRole] = useState<Role>(null);

  // Function to render picture content based on selected role
  const renderRolePictureContent = () => {
    if (!role) return null;

    switch (role) {
      case 'seller':
        return (
          <div className="mt-8 flex justify-center">
            <div className={`w-11/12 bg-white p-6 rounded-xl shadow-lg ${role ? 'animate__animated animate__fadeIn' : ''}`}>
              <h2 className="text-xl font-bold text-green-600">賣家圖文說明</h2>
              <p className="text-gray-600 mt-4">這裡可以放一些賣家圖文教學內容。</p>
            </div>
          </div>
        );
      case 'tribebuyer':
        return (
          <div className="mt-8 flex justify-center w-full">
            <div className="w-11/12">
              <TribeBuyerTutorial />
            </div>
          </div>
        );
      case 'driver':
        return (
          <div className="mt-8 flex justify-center w-full">
            <div className="w-11/12">
              <DriverTutorial />
            </div>
          </div>
        );
      case 'buyer':
        return (
          <div className="mt-8 flex justify-center">
            <div className={`w-11/12 bg-white p-6 rounded-xl shadow-lg ${role ? 'animate__animated animate__fadeIn' : ''}`}>
              <h2 className="text-xl font-bold text-green-600">山下買家圖文說明</h2>
              <p className="text-gray-600 mt-4">這裡可以放一些山下買家圖文教學內容。</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRoleVideoContent = () => {
    if (!role) return null;

    const videoUrls = {
      seller: "https://drive.google.com/file/d/1GUbCEWnjVAVEYf5XwSkaVw-taDZpFY8d/preview",
      tribebuyer: "https://drive.google.com/file/d/1GUbCEWnjVAVEYf5XwSkaVw-taDZpFY8d/preview",
      driver: "https://drive.google.com/file/d/1GUbCEWnjVAVEYf5XwSkaVw-taDZpFY8d/preview",
      buyer: "https://drive.google.com/file/d/1GUbCEWnjVAVEYf5XwSkaVw-taDZpFY8d/preview"
    };

    return role ? (
      <div className="mt-8 flex justify-center">
        <iframe
          src={videoUrls[role]}
          width="640"
          height="360"
          allow="autoplay"
          className={`rounded-xl shadow-lg ${role ? 'animate__animated animate__fadeIn' : ''}`}
        ></iframe>
      </div>
    ) : null;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-slate-100">
      <div className="w-full h-full lg:p-8 p-2">
        {/* Header Section */}
        <div className="lg:h-96 h-52 relative w-full overflow-hidden bg-green-600 flex flex-col items-center justify-center rounded-xl shadow-2xl transition hover:bg-green-400">
          <div className="absolute inset-0 w-full h-full bg-slate-600 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="lg:text-4xl text-3xl flex flex-col items-center justify-center text-white font-mono lg:text-5xl font-extrabold">
            順 路 經 濟 平 台
          </div>
          <p className="lg:text-lg text-sm text-center lg:mt-2 text-neutral-300 relative z-20 font-mono">
            給 您 最 簡 單 的 購 物 體 驗
          </p>
        </div>

        {/* Main Button Area */}
        <div className="mt-8 flex flex-row gap-6 justify-center">
          <Button
            className={`lg:h-16 h-12 lg:w-1/4 w-1/2 lg:text-xl text-md rounded-full shadow-lg hover:scale-105 transform transition duration-200 text-white ${
              mainSection === 'experience' 
                ? 'bg-green-500 hover:bg-green-400' 
                : 'bg-gray-400 hover:bg-gray-300'
            }`}
            onClick={() => {
              setMainSection(mainSection === 'experience' ? null : 'experience');
              setGuideSection(null);
            }}
          >
            立即體驗
          </Button>
          <Button
            className={`lg:h-16 h-12 lg:w-1/4 w-1/2 lg:text-xl text-md rounded-full shadow-lg hover:scale-105 transform transition duration-200 text-white ${
              mainSection === 'guide' 
                ? 'bg-green-500 hover:bg-green-400' 
                : 'bg-gray-400 hover:bg-gray-300'
            }`}
            onClick={() => {
              setMainSection(mainSection === 'guide' ? null : 'guide');
              setGuideSection(null);
            }}
          >
            使用指南
          </Button>
        </div>

        {/* Experience Section */}
        {mainSection === 'experience' && (
          <div className="mt-8 grid lg:grid-cols-3 grid-cols-1 gap-6">
            {[
              { title: "註冊與登入", link: "/login" },
              { title: "部落居民專區-購買服務", link: "/tribe_resident/buyer" },
              { title: "部落居民專區-商品上架服務", link: "/tribe_resident/seller" },
              { title: "購買農產品專區", link: "/consumer" },
              { title: "司機專區", link: "/driver" },
            ].map((item, index) => (
              <Link
                href={item.link}
                key={index}
                className="flex items-center justify-center bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transform hover:scale-105 transition duration-200"
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-700">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Guide Section */}
        {mainSection === 'guide' && (
          <div className="mt-8 flex flex-col lg:flex-row gap-6 justify-center items-center">
            {/* Guide Text Card Button */}
            <Button
              className={`lg:w-1/4 w-full h-24 rounded-xl border-2 ${
                guideSection === 'guideText' ? 'border-green-400 bg-green-100' : 'border-green-500 bg-white'
              } shadow-lg hover:bg-green-200 hover:border-green-400 hover:scale-105 transform transition duration-200 text-green-500 flex items-center justify-center`}
              onClick={() => setGuideSection(guideSection === 'guideText' ? null : 'guideText')}
            >
              <span className="text-lg font-semibold">圖文說明</span>
            </Button>
            {/* Guide Video Card Button */}
            <Button
              className={`lg:w-1/4 w-full h-24 rounded-xl border-2 ${
                guideSection === 'guideVideo' ? 'border-green-400 bg-green-100' : 'border-green-500 bg-white'
              } shadow-lg hover:bg-green-200 hover:border-green-400 hover:scale-105 transform transition duration-200 text-green-500 flex items-center justify-center`}
              onClick={() => setGuideSection(guideSection === 'guideVideo' ? null : 'guideVideo')}
            >
              <span className="text-lg font-semibold">影片說明</span>
            </Button>
          </div>
        )}

          {/* Role Selection after selecting guide */}
          {(guideSection === 'guideText' || guideSection === 'guideVideo') && (
            <div className="mt-8 space-y-4">
              {/* First Row: Seller and Driver */}
              <div className="flex gap-6 justify-center">
                <Button
                  className={`lg:w-1/4 w-full h-12 rounded-xl ${
                    role === 'seller' ? 'bg-green-100' : 'bg-white'
                  } border-2 border-green-500 shadow-lg hover:bg-green-50 hover:scale-105 transform transition duration-200 text-green-600`}
                  onClick={() => setRole(role === 'seller' ? null : 'seller')}
                >
                  賣家
                </Button>
                <Button
                  className={`lg:w-1/4 w-full h-12 rounded-xl ${
                    role === 'driver' ? 'bg-green-100' : 'bg-white'
                  } border-2 border-green-500 shadow-lg hover:bg-green-50 hover:scale-105 transform transition duration-200 text-green-600`}
                  onClick={() => setRole(role === 'driver' ? null : 'driver')}
                >
                  司機
                </Button>
              </div>
              
              {/* Second Row: Tribe Buyer and Buyer */}
              <div className="flex gap-6 justify-center">
                <Button
                  className={`lg:w-1/4 w-full h-12 rounded-xl ${
                    role === 'tribebuyer' ? 'bg-green-100' : 'bg-white'
                  } border-2 border-green-500 shadow-lg hover:bg-green-50 hover:scale-105 transform transition duration-200 text-green-600`}
                  onClick={() => setRole(role === 'tribebuyer' ? null : 'tribebuyer')}
                >
                  山上買家
                </Button>
                <Button
                  className={`lg:w-1/4 w-full h-12 rounded-xl ${
                    role === 'buyer' ? 'bg-green-100' : 'bg-white'
                  } border-2 border-green-500 shadow-lg hover:bg-green-50 hover:scale-105 transform transition duration-200 text-green-600`}
                  onClick={() => setRole(role === 'buyer' ? null : 'buyer')}
                >
                  山下買家
                </Button>
              </div>
            </div>
          )}

 

        {/* Guide Text Content */}
        {guideSection === 'guideText' && (
            renderRolePictureContent()
        )}

        {/* Guide Video Content */}
        {guideSection === 'guideVideo' && (
            renderRoleVideoContent()
        )}
      </div>
    </main>
  );
}
