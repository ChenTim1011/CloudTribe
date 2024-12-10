"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/tribe_resident/buyer/Sidebar";
import SearchBar from "@/components/tribe_resident/buyer/SearchBar";
import ItemList from "@/components/tribe_resident/buyer/ItemList";
import CartModal from "@/components/tribe_resident/buyer/CartModal";
import AddItemForm from "@/components/tribe_resident/buyer/AddItemForm";
import OrderManagement from "@/components/tribe_resident/buyer/OrderManagement";
import "@/app/styles/globals.css";
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useMediaQuery } from "react-responsive";
import UserService from "@/services/user/user";
import { Product } from "@/interfaces/tribe_resident/buyer/buyer";
import { CartItem } from "@/interfaces/tribe_resident/buyer/buyer";
import { Order } from "@/interfaces/tribe_resident/buyer/order";

/**
 * The number of items to display per page
 */
const ITEMS_PER_PAGE = 16;

/**
 * A functional component representing the buyer's page where users can browse and add items to their cart.
 */
const BuyerPage: React.FC = () => {

  // Use lazy initialization to load the cart from the local storage
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      try {
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (e) {
        console.error("localStorage error:", e);
        return [];
      }
    }
    return [];
  });

  // State variables for managing products, cart, and user data
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false);
  const [user, setUser] = useState(UserService.getLocalStorageUser());
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Media query hooks to detect the device type
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });


  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Handles the click event for the "Test login status" button
   */

  const handleApplyBuyerClick = () => {
    if (!user || user.id === 0 || user.name === 'empty' || user.phone === 'empty') {
        alert('請先按右上角的登入');
    } else {
        setIsCartOpen(true)
    }
  };

  /**
   * Fetches order data from the server and updates the state
   */
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const allOrders: Order[] = await response.json();
      setOrders(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  /**
   * Sets up an event listener to handle changes in user data
   */
  useEffect(() => {
    const handleUserDataChanged = () => {
      const updatedUser = UserService.getLocalStorageUser();
      setUser(updatedUser);
    };

    window.addEventListener("userDataChanged", handleUserDataChanged);

    return () => {
      window.removeEventListener("userDataChanged", handleUserDataChanged);
    };
  }, []);


  useEffect(() => {
    try {
      if (cart.length === 0) {
        localStorage.removeItem('cart');
      } else {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    } catch (e) {
      console.error("Error saving cart to localStorage:", e);
    }
  }, [cart]);

  /**
   * Handles the click event for viewing filled forms.
   * Fetches order data and opens the form modal if the user is logged in.
   */
  const handleViewForm = () => {
    if (!user || user.id === 0) {
      alert("請先按右上角的登入");
    } else {
      fetchOrders();
      setIsFormOpen(true);
    }
  };

  /**
   * Filters products by category and updates the filteredProducts state
   * @param {string} category - The selected category to filter by
   */
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

  /**
   * Searches for products by name and updates the filteredProducts state
   * @param {string} query - The search query
   */
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

  /**
   * Adds a product to the cart with the specified quantity
   * @param {Product} product - The product to add
   * @param {number} quantity - The quantity of the product to add
   */
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Update the quantity of the existing item
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Add a new item to the cart
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  /**
   * Removes an item from the cart by its ID
   * @param {string} id - The ID of the item to remove
   */
  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  /**
   * Updates the quantity of an item in the cart
   * @param {string} id - The ID of the item to update
   * @param {number} quantity - The new quantity for the item
   */
  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item
      )
    );
  };

  /**
   * Clears all items from the cart
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Fetches product data from the server when the component mounts
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data.json");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Product[] = await response.json();
        setProducts(data);
        setInitialLoad(false);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <NavigationBar />
      <div
        className="flex min-h-screen"
        style={{
          backgroundImage: "url('/eat.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
          height: "400px",
        }}
      >
        <div className="w-full content flex-grow p-4 sm:p-10 bg-white bg-opacity-50 flex flex-col items-center">
          {/* Container for all buttons and content */}
          <div className="w-full max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6">
              今天我想要來點...
            </h1>

            {/* Buttons container */}
            <div className="w-full flex flex-col items-center gap-4 mb-6">
              {/* Shopping cart button */}
              <div className="w-full flex justify-center">
                {isMounted && (
                  <Button
                    variant="outline"
                    onClick={handleApplyBuyerClick}
                    className="w-full sm:w-80 px-4 py-2 text-lg font-bold border-2 border-black-500 text-black-500 hover:bg-blue-500 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    {`購物車 (${cart.reduce((total, item) => total + item.quantity, 0)})`}
                  </Button>
                )}
              </div>

              {/* View forms button */}
              <div className="w-full flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleViewForm}
                  className="w-full sm:w-80"
                >
                  查看已填寫表單
                </Button>
              </div>

              {/* Add item button */}
              <div className="w-full flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddItemFormOpen(true)}
                  className="w-full sm:w-80"
                >
                  如果商品找不到，請點此新增
                </Button>
              </div>
            </div>

            {/* Search and Filter container */}
            <div className="w-full flex flex-col items-center gap-4 mb-6">
              <div className="w-full sm:w-80">
                <SearchBar onSearch={handleSearch} className="w-full" />
              </div>
              <div className="w-full sm:w-80">
                <Sidebar filterCategory={handleFilterCategory} className="w-full" />
              </div>
            </div>

            {/* Selected category display */}
            {selectedCategory && (
              <div className="w-full text-2xl font-semibold text-center mb-6">
                商品種類: {selectedCategory}
              </div>
            )}

          {/* Product list */}
          {!initialLoad && (filteredProducts.length > 0 ? (
            <ItemList
              products={filteredProducts}
              itemsPerPage={ITEMS_PER_PAGE}
              addToCart={handleAddToCart}
            />
          ) : (
            <p className="mt-4 text-center">找不到任何商品</p>
          ))}

          {/* Add item form */}
          {isAddItemFormOpen && (
            <AddItemForm
              onClose={() => setIsAddItemFormOpen(false)}
              addToCart={(item) =>
                handleAddToCart(
                  { ...item, category: "Purchase", id: Date.now().toString() },
                  item.quantity
                )
              }
            />
          )}

          {/* Cart modal */}
          {isCartOpen && (
            <CartModal
              cart={cart}
              onClose={() => setIsCartOpen(false)}
              removeFromCart={handleRemoveFromCart}
              updateQuantity={handleUpdateQuantity}
              clearCart={clearCart}
              cartItems={cart}
              totalPrice={cart.reduce((total, item) => total + item.price * item.quantity, 0)}
            />
          )}

          {/* Order management sheet */}
          <OrderManagement
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            orders={orders}
            fetchOrders={fetchOrders}
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default BuyerPage;
