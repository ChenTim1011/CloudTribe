"use client";

import React, { useState } from 'react';
import DriverForm from "@/components/driver/DriverForm";
import { Button } from "@/components/ui/button";

const DriverPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            <Button onClick={() => setShowForm(true)}>我要成為司機</Button>
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded">
                        <Button onClick={() => setShowForm(false)} className="mb-4">關閉</Button>
                        <DriverForm />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverPage;
