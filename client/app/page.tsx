'use client';
import React, { useState } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import TribeBuyerTutorial from '@/components/tutorials/TribeBuyerTutorial';
import DriverTutorial from '@/components/tutorials/DriverTutorial';
import TribeSellerTutorial from '@/components/tutorials/TribeSellerTutorial';
import ConsumerTutorial from '@/components/tutorials/ConsumerTutorial';
import { NavigationBar } from "@/components/NavigationBar";
import Modal from '@/components/Modal'; // 引入自訂 Modal

// Define the main section types
type MainSection = 'experience' | 'guide' | null;

// Define the guide sub-section types
type GuideSection = 'guideText' | 'guideVideo' | null;

// Define role types
type Role = 'seller' | 'driver' | 'tribebuyer' | 'buyer' | null;

export default function Page() {
  const [guideSection, setGuideSection] = useState<GuideSection>(null);
  const [role, setRole] = useState<Role>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Function to handle role selection
  const handleRoleSelection = (selectedRole: Role) => {
    setRole(selectedRole);
    if (guideSection === 'guideVideo') {
      setIsModalOpen(true);
    }
  };

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

    return (
      <div className="flex justify-center">
        <iframe
          src={videoUrls[role]}
          width="640"
          height="360"
          allow="autoplay; fullscreen"
          allowFullScreen
          className={`rounded-xl shadow-lg ${role ? 'animate__animated animate__fadeIn' : ''}`}
        ></iframe>
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-slate-100">
      <NavigationBar />
      <div className="w-full h-full lg:p-8 p-2">
        {/* Header Section */}
        <div className="mb-20 lg:h-96 h-52 relative w-full overflow-hidden bg-green-600 flex flex-col items-center justify-center rounded-xl shadow-2xl transition hover:bg-green-400">
          <div className="absolute inset-0 w-full h-full bg-slate-600 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="lg:text-4xl text-3xl flex flex-col items-center justify-center text-white font-mono lg:text-5xl font-extrabold">
            順 路 經 濟 平 台
          </div>
          <p className="lg:text-lg text-sm text-center lg:mt-2 text-neutral-300 relative z-20 font-mono">
            給 您 最 簡 單 的 購 物 體 驗
          </p>
        </div>

        {/* Announcement Area */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertDescription className="ml-2 text-blue-800">
            <p className="font-medium mb-2">
              歡迎來到順路經濟平台！ 請點擊上方頁面導覽，瀏覽各項功能。
            </p>
            <p className="font-medium">
              如果是首次使用平台，請先點選上方「註冊與登入」進行註冊。
            </p>
          </AlertDescription>
        </Alert>

        {/* Guide Section */}
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

        {/* Role Selection */}
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

        {guideSection === 'guideText' && (
renderRolePictureContent()
)}

        {guideSection === 'guideVideo' && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            {renderRoleVideoContent()}
          </Modal>
        )}
      </div>
    </main>
  );
}
