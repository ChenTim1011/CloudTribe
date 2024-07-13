"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type SidebarProps = {
  filterCategory: (category: string) => void;
};

const categories = [
  {
    name: "蔬菜水果．農特產",
    subcategories: ["各式蔬菜", "季節水果", "菇菌類"],
  },
  {
    name: "肉品",
    subcategories: ["牛", "豬", "雞．鴨", "調味肉品", "火鍋肉片"],
  },
  {
    name: "海鮮水產",
    subcategories: ["加工海鮮", "鮮魚", "蝦類", "魚乾"],
  },
  {
    name: "調味．罐頭湯品．南北貨",
    subcategories: [
      "調味品",
      "抹醬．沾醬",
      "水果抹醬",
      "花生．巧克力醬",
      "罐頭",
    ],
  },
  {
    name: "茶飲．咖啡",
    subcategories: [
      "綠茶．烏龍茶．其他茶飲",
      "紅茶．花茶．水果茶",
      "咖啡",
      "奶精",
      "沖泡飲品",
    ],
  },
  {
    name: "飲品",
    subcategories: ["機能飲料", "保健養生", "蔬果汁"],
  },
  {
    name: "餅乾．巧克力",
    subcategories: ["精選餅乾", "鹹餅乾", "甜餅乾", "巧克力"],
  },
  {
    name: "個人清潔",
    subcategories: [
      "洗護造型",
      "卸妝洗顏",
      "口腔清潔用品",
      "刮鬍用品",
      "女性衛生",
      "衛生棉",
      "棉條",
      "保養洗護",
      "染髮劑．用品",
      "彩妝．護唇膏",
      "乳液．防曬．保養",
    ],
  },
  {
    name: "家庭清潔",
    subcategories: [
      "清潔工具",
      "家用清潔",
      "衣物洗晾收納",
      "除濕．香氛",
      "衛浴用品",
    ],
  },
  {
    name: "廚房用品",
    subcategories: ["餐廚用品", "保鮮容器", "廚房整理", "料理．烘焙器具"],
  },
  {
    name: "家居用品",
    subcategories: [
      "燈泡．燈具",
      "延長線",
      "電池",
      "居家保護用品",
      "五金材料",
      "DIY工具",
      "油漆．粉刷",
    ],
  },
  {
    name: "露營．車宿",
    subcategories: ["BBQ烤肉器具", "免洗餐具"],
  },
  {
    name: "其它",
    subcategories: ["乾淨飲水", "濾水壺．濾芯", "濾心．濾芯", "飲水壺．保溫保冰"],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ filterCategory }) => {
  return (
    <Accordion type="single" collapsible className="w-64">
      {categories.map((category, idx) => (
        <AccordionItem key={idx} value={`item-${idx}`}>
          <AccordionTrigger>{category.name}</AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col p-2 space-y-1">
              {category.subcategories.map((subcategory, subIdx) => (
                <li key={subIdx}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      filterCategory(subcategory);
                    }}
                    className="block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    {subcategory}
                  </a>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default Sidebar;
