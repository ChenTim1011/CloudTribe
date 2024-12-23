'use client';
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import TribeBuyerTutorial from '@/components/tutorials/TribeBuyerTutorial';
import DriverTutorial from '@/components/tutorials/DriverTutorial';
import TribeSellerTutorial from '@/components/tutorials/TribeSellerTutorial';
import ConsumerTutorial from '@/components/tutorials/ConsumerTutorial';

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
  const [showScrollMessage, setShowScrollMessage] = useState<boolean>(false); // New state

  // Handler for role selection
  const handleRoleSelection = (selectedRole: Role) => {
    setRole(prevRole => (prevRole === selectedRole ? null : selectedRole));
    if (mainSection === 'guide') {
      setShowScrollMessage(true);
    }
  };

  // Auto-hide the scroll message after 5 seconds
  useEffect(() => {
    if (showScrollMessage) {
      const timer = setTimeout(() => setShowScrollMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showScrollMessage]);

  // Function to render picture content based on selected role
  const renderRolePictureContent = () => {
    if (!role) return null;

    switch (role) {
      case 'seller':
        return (
          <div className="mt-8 flex justify-center w-full">
            <div className="w-11/12">
              <TribeSellerTutorial />
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
          <div className="mt-8 flex justify-center w-full">
            <div className="w-11/12">
              <ConsumerTutorial />
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
      seller: "https://www.youtube.com/embed/29SxFI6WWD4",
      tribebuyer: "https://www.youtube.com/embed/hjn2Sm5dd9s",
      driver: "https://www.youtube.com/embed/wcOt4QaqB3g",
      buyer: "https://www.youtube.com/embed/Q4g4HAuLtNw"
    };

    return role ? (
      <div className="mt-8 flex justify-center">
        <iframe
          src={videoUrls[role]}
          width="640"
          height="360"
          allow="autoplay; fullscreen"
          allowFullScreen
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

        {/* Announcement Area */}
        <Alert className="mt-8 bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertDescription className="ml-2 text-blue-800">
            <p className="font-medium mb-2">
              歡迎來到順路經濟平台！ 
            </p>
            <p className="font-medium">
              如果是第一次使用平台，請點選「立即體驗」，
              並進入「首次註冊與登入」頁面按下首次註冊按鈕！
            </p>
          </AlertDescription>
        </Alert>

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
              setShowScrollMessage(false); // Reset scroll message
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
              setShowScrollMessage(false); // Reset scroll message
            }}
          >
            使用指南
          </Button>
        </div>

        {/* Experience Section */}
        {mainSection === 'experience' && (
          <div className="mt-8 grid lg:grid-cols-3 grid-cols-1 gap-6">
            {[
              { title: "首次註冊與登入", link: "/login" },
              { title: "部落買家專區-購買生活用品", link: "/tribe_resident/buyer" },
              { title: "部落賣家專區-農產品上架", link: "/tribe_resident/seller" },
              { title: "團購農產品專區", link: "/consumer" },
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

        {/* Scroll Prompt Message */}
        {showScrollMessage && (
          <Alert className="mt-4 bg-yellow-50 border-yellow-200">
            <Info className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2 text-yellow-800">
              請往下滑收看相關內容。
            </AlertDescription>
          </Alert>
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
                onClick={() => handleRoleSelection('seller')}
              >
                部落賣家
              </Button>
              <Button
                className={`lg:w-1/4 w-full h-12 rounded-xl ${
                  role === 'driver' ? 'bg-green-100' : 'bg-white'
                } border-2 border-green-500 shadow-lg hover:bg-green-50 hover:scale-105 transform transition duration-200 text-green-600`}
                onClick={() => handleRoleSelection('driver')}
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
                onClick={() => handleRoleSelection('tribebuyer')}
              >
                部落買家
              </Button>
              <Button
                className={`lg:w-1/4 w-full h-12 rounded-xl ${
                  role === 'buyer' ? 'bg-green-100' : 'bg-white'
                } border-2 border-green-500 shadow-lg hover:bg-green-50 hover:scale-105 transform transition duration-200 text-green-600`}
                onClick={() => handleRoleSelection('buyer')}
              >
                團購買家
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
