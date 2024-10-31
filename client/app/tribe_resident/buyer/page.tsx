"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/tribe_resident/buyer/Sidebar";
import SearchBar from "@/components/tribe_resident/buyer/SearchBar";
import ItemList from "@/components/tribe_resident/buyer/ItemList";
import CartModal from "@/components/tribe_resident/buyer/CartModal";
import AddItemForm from "@/components/tribe_resident/buyer/AddItemForm"; 
import BuyerOrderCard from "@/components/tribe_resident/buyer/BuyerOrderCard";
import "@/app/styles/globals.css";
import { NavigationBar } from "@/components/NavigationBar"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from 'react-responsive';
import UserService from '@/services/user/user'; 
import { Product } from '@/interfaces/tribe_resident/buyer/Product';
import { CartItem } from "@/interfaces/tribe_resident/buyer/CartItem";
import { Order } from "@/interfaces/order/Order";
import { set } from "date-fns";


const ITEMS_PER_PAGE = 16;

const BuyerPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false); 
  const [user, setUser] = useState(UserService.getLocalStorageUser());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

    // Define media queries
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
    const isDesktop = useMediaQuery({ minWidth: 1025 });

    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const allOrders: Order[] = await response.json();
        setOrders(allOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    useEffect(() => {
      // get user data from local storage
      const handleUserDataChanged = () => {
        const updatedUser = UserService.getLocalStorageUser();
        setUser(updatedUser);
      };
  
      window.addEventListener('userDataChanged', handleUserDataChanged);
  
      return () => {
        window.removeEventListener('userDataChanged', handleUserDataChanged);
      };
    }, []);
  
    useEffect(() => {
      // fetch orders from API
      const fetchOrders = async () => {
        try {
          const response = await fetch('/api/orders'); 
          const allOrders: Order[] = await response.json();
          setOrders(allOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };
  
      fetchOrders();
    }, []);

    useEffect(() => {
      // filter orders based on user id
      if (user && user.id) {
        const userOrders = orders.filter(order => order.buyer_id === user.id);
        setFilteredOrders(userOrders);
      }
    }, [orders, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Product[] = await response.json();
        console.log('Loaded products:', data);
        setProducts(data);
        setInitialLoad(false);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFormButtonClick = () => {
    if (!user || user.id === 0 || user.name === 'empty' || user.phone === 'empty') {
      alert('請先按右上角的登入');
    } else {
      setIsFormOpen(true);
    }
  };

  const handleCartButtonClick = () => {
    if (!user || user.id === 0 || user.name === 'empty' || user.phone === 'empty') {
      alert('請先按右上角的登入');
    } else {
      setIsCartOpen(true);
    }
  };

  const handleViewForm = async () => {
    if ( user && user.id){
      const userOrders = orders.filter(order => order.buyer_id === user.id);
      setFilteredOrders(userOrders)
      await fetchOrders();
    }
    setIsFormOpen(true);
    
  };

  const handleFilterCategory = useCallback(
    (category: string) => {
      console.log("Selected Category:", category);
      const filtered = products.filter((product) => product.category === category);
      console.log("Filtered products:", filtered);
      setFilteredProducts(filtered);
      setSelectedCategory(category);
    },
    [products]
  );

  const handleSearch = useCallback(
    (query: string) => {
      console.log("Search query:", query);
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
      setSelectedCategory(null);
    },
    [products]
  );

  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };


  

  return (
    <div>
      <NavigationBar /> 
      <div
        className="flex h-screen"
        style={{
          backgroundImage: "url('/eat.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1, 
          height: '400px', 
        }}
      >
       <div className={`content flex-grow p-10 bg-white bg-opacity-50 flex flex-col items-center ${isMobile ? 'mobile-class' : isTablet ? 'tablet-class' : 'desktop-class'}`}>
          <div className={`fixed ${isMobile ? 'relative' : 'top-20 left-4'} z-50`}>
            <Button 
              variant="outline" 
              onClick={handleCartButtonClick}
              className="px-4 py-2 text-lg font-bold border-2 border-black-500 text-black-500 hover:bg-blue-500 hover:text-white"
            >
              <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
              {`購物車結帳 (${cart.reduce((total, item) => total + item.quantity, 0)})`}
            </Button>
          </div>
          <div className="w-full flex justify-center space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddItemFormOpen(true)}>如果找不到，手動填寫商品</Button>
          </div>
          <div className="w-full flex justify-start space-x-2 mt-4">
          </div>
          <h1 className={`mb-2 text-4xl font-bold text-center ${isMobile ? 'text-2xl' : ''}`}>今天我想要來點...</h1>
          
          {/* 查看表單按鈕 */}
          <div className="mb-3 w-full flex justify-center space-x-2 mt-4">
            <Button variant="outline" onClick={handleViewForm}>
              查看已填寫表單
            </Button>
          </div>

          <div className="flex justify-center w-full mb-3">
            <SearchBar onSearch={handleSearch} className="w-80" />
          </div>

          <div className="flex justify-center w-full mb-3">
            <Sidebar filterCategory={handleFilterCategory} className="w-80" />
          </div>
          {selectedCategory && (
            <div className="mt-3 text-2xl font-semibold text-center">
              商品種類: {selectedCategory}
            </div>
          )}
          {!initialLoad && filteredProducts.length > 0 && (
            <ItemList products={filteredProducts} itemsPerPage={ITEMS_PER_PAGE} addToCart={handleAddToCart} />
          )}
          {isAddItemFormOpen && (
            <AddItemForm
              onClose={() => setIsAddItemFormOpen(false)}
              addToCart={(item) => handleAddToCart({ ...item, category: "", id: "" }, item.quantity)}
            />
          )}
          {isCartOpen && (
            <CartModal
              cart={cart}
              onClose={() => setIsCartOpen(false)}
              removeFromCart={handleRemoveFromCart}
              updateQuantity={handleUpdateQuantity}
              clearCart={() => setCart([])}
              cartItems={cart}
              totalPrice={cart.reduce((total, item) => total + item.price * item.quantity, 0)}  
            />
          )}

                {/* 查看表單的 Sheet */}
                <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <SheetContent className="w-full max-w-2xl h-full overflow-y-auto" aria-describedby="form-description">
                          <SheetHeader>
                            <SheetTitle>我的表單詳細內容</SheetTitle>
                            <SheetClose />
                          </SheetHeader>
                          <div className="p-4">
                            {filteredOrders.length > 0 ? (
                              filteredOrders.map(order => (
                                <BuyerOrderCard key={order.id} order={order} />
                              ))
                            ) : (
                  <p>目前沒有相關的訂單。</p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default BuyerPage;
