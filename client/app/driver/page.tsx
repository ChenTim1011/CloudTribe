"use client";

import React, { useState } from 'react';
import DriverForm from "@/components/driver/DriverForm";
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const DriverPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            <NavigationBar />
            <div
                className="flex h-screen"
                style={{
                    backgroundImage: "url('/road.jpg')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 1,
                    height: '400px',
                }}
            >
                <div className="content flex-grow p-10 bg-white bg-opacity-10 flex flex-col items-center">
                    <div className="w-full flex justify-start space-x-2 mt-4">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            返回主頁
                        </Button>
                    </div>
                    <h1 className="mb-20 text-4xl font-bold text-white text-center" style={{ marginTop: '40px' }}>感謝您的服務</h1>
                    <Button 
                        className="mb-10 px-6 py-3 text-lg  text-black bg-white hover:bg-blue-500 hover:text-white"
                        variant="outline"
                        onClick={() => setShowForm(true)}
                    >
                        我要成為司機
                    </Button>
                    <DriverForm isOpen={showForm} onClose={() => setShowForm(false)} />
                </div>
            </div>
        </div>
    );
};

export default DriverPage;
