"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  const handleSave = async () => {
    if (userId) {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setName(data.name);
      setPhone(data.phone);
    } else {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await response.json();
      setUserId(data.id);
    }
  };

  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="info">User Info</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="info">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
            <CardDescription>
              View and edit your user information here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current-name">Current Name</Label>
              <Input id="current-name" value={name} readOnly />
            </div>
            <div className="space-y-1">
              <Label htmlFor="current-phone">Current Phone</Label>
              <Input id="current-phone" value={phone} readOnly />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default UserForm