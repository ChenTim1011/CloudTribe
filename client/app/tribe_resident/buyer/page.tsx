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
import { Product } from "@/interfaces/tribe_resident/buyer/Product";
import { CartItem } from "@/interfaces/tribe_resident/buyer/CartItem";
import { Order } from "@/interfaces/order/Order";

/**
 * The number of items to display per page
 */
const ITEMS_PER_PAGE = 16;

/**
 * A functional component representing the buyer's page where users can browse and add items to their cart.
 */
const BuyerPage: React.FC = () => {
  // State variables for managing products, cart, and user data
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
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

  /**
   * Handles the click event for viewing filled forms.
   * Fetches order data and opens the form modal if the user is logged in.
   */
  const handleViewForm = () => {
    if (!user || user.id === 0) {
      alert("Please log in by clicking the top right corner");
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
      const existingItem = prevCart.find((item) => item.name === product.name);

      if (existingItem) {
        // Update the quantity of the existing item
        return prevCart.map((item) =>
          item.name === product.name ? { ...item, quantity: item.quantity + quantity } : item
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
        console.log("Loaded products:", data);
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
        className="flex h-screen"
        style={{
          backgroundImage: "url('/eat.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
          height: "400px",
        }}
      >
        <div
          className={`content flex-grow p-10 bg-white bg-opacity-50 flex flex-col items-center ${
            isMobile ? "mobile-class" : isTablet ? "tablet-class" : "desktop-class"
          }`}
        >
          {/* Shopping cart button */}
          <div className={`fixed ${isMobile ? "relative" : "top-20 left-4"} z-50`}>
            <Button
              variant="outline"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 text-lg font-bold border-2 border-black-500 text-black-500 hover:bg-blue-500 hover:text-white"
            >
              <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
              {`購物車 (${cart.reduce((total, item) => total + item.quantity, 0)})`}
            </Button>
          </div>

          {/* Manual item addition button */}
          <div className="mb-3 w-full flex justify-center space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddItemFormOpen(true)}>
              如果商品找不到，請點此新增
            </Button>
          </div>

          {/* Page title */}
          <h1 className={`mb-3 text-4xl font-bold text-center ${isMobile ? "text-2xl" : ""}`}>
            今天我想要來點...
          </h1>

          {/* View filled forms button */}
          <div className="mb-3 w-full flex justify-center space-x-2 mt-4">
            <Button variant="outline" onClick={handleViewForm}>
              查看已填寫表單
            </Button>
          </div>

          {/* Search bar */}
          <div className="flex justify-center w-full mb-3">
            <SearchBar onSearch={handleSearch} className="w-80" />
          </div>

          {/* Sidebar for category filtering */}
          <div className="flex justify-center w-full mb-3">
            <Sidebar filterCategory={handleFilterCategory} className="w-80" />
          </div>

          {/* Display selected category */}
          {selectedCategory && (
            <div className="mt-5 text-2xl font-semibold text-center">
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
  );
};

export default BuyerPage;
