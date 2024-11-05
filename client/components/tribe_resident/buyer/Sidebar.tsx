"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Define the SidebarProps type for component props.
type SidebarProps = {
  filterCategory: (category: string) => void; // A function to filter categories.
  className?: string; // Optional className prop for additional styling.
};

// Define the categories and their subcategories.
const categories = [
  {
    name: "政大周邊商家",
    subcategories: ["小木屋鬆餅", "金鰭", "原丼力"],
  },
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

/**
 * Sidebar component for selecting categories and subcategories.
 * @param filterCategory - Function to filter the selected subcategory.
 * @param className - CSS class name for the component.
 */
const Sidebar: React.FC<SidebarProps> = ({ filterCategory, className }) => {
  // State to manage the selected category.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // State to manage the popover open state.
  const [open, setOpen] = useState(false);
  // State to manage the sheet open state.
  const [sheetOpen, setSheetOpen] = useState(false);

  /**
   * Function to handle category selection.
   * @param categoryName - The name of the selected category.
   */
  const handleCategorySelect = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    setSelectedCategory(category ? category.name : null);
    setOpen(false); // Close the popover when a category is selected.
    setSheetOpen(true);
  };

  /**
   * Function to handle subcategory selection.
   * @param subcategory - The selected subcategory.
   */
  const handleSubcategorySelect = (subcategory: string) => {
    filterCategory(subcategory); // Filter the selected subcategory.
    setSheetOpen(false); // Close the sheet when a subcategory is selected.
  };

  // Find the object for the selected category.
  const selectedCategoryObject = categories.find(
    (category) => category.name === selectedCategory
  );

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCategory || "選擇您想要的商品種類..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="選擇您想要的商品種類..." />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                  key={category.name}
                  value={category.name}
                  onSelect={() => {
                    handleCategorySelect(category.name);
                  }}
                >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategory === category.name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedCategory && selectedCategoryObject && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="mt-4 w-full">
              {selectedCategory}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{selectedCategory}</SheetTitle>
              <SheetDescription>選擇想要的種類</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {selectedCategoryObject.subcategories.map((subcategory) => (
                <div key={subcategory}>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={() => handleSubcategorySelect(subcategory)}
                  >
                    {subcategory}
                  </Button>
                </div>
              ))}
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default Sidebar;
