// src/components/TestLayout.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function TestLayout() {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Test Layout Container
          </h2>
          <p className="text-gray-600">
            Đây là test để kiểm tra container có căn giữa không
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Card 1</h3>
              <p className="text-sm text-gray-600">
                Nội dung test card 1
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Card 2</h3>
              <p className="text-sm text-gray-600">
                Nội dung test card 2
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Card 3</h3>
              <p className="text-sm text-gray-600">
                Nội dung test card 3
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}