import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  const addToCart = (product) => {
    const price = parseFloat(product.price); // Konversi harga ke angka
    if (!isNaN(price)) {
      setCartItems((prevItems) => {
        const itemIndex = prevItems.findIndex((item) => item.id === product.id);
        if (itemIndex !== -1) {
          const updatedItems = [...prevItems];
          updatedItems[itemIndex].quantity += 1;
          return updatedItems;
        } else {
          return [...prevItems, { ...product, price, quantity: 1 }]; // Pastikan harga adalah angka
        }
      });
    } else {
      console.error('Invalid product price:', product.price);
    }
  };

  const addCompletedOrder = (orderDetails) => {
    setCompletedOrders((prevOrders) => [...prevOrders, orderDetails]);
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, completedOrders, setCompletedOrders, addCompletedOrder }}>
      {children}
    </CartContext.Provider>
  );
};
