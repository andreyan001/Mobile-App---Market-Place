import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CartContext } from '../component/CartContext';
import { getDatabase, ref, set, remove, get, child, update } from 'firebase/database'; 
import { getAuth } from 'firebase/auth'; 

const CartScreen = ({ navigation }) => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const auth = getAuth();
      const uid = auth.currentUser.uid;
      const db = getDatabase();
      const cartRef = ref(db, `users/${uid}/cart`);

      try {
        const cartSnapshot = await get(cartRef);
        if (cartSnapshot.exists()) {
          const items = [];
          cartSnapshot.forEach((childSnapshot) => {
            items.push({ key: childSnapshot.key, ...childSnapshot.val() });
          });
          setCartItems(items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const getTotalPrice = () => {
    return selectedItems.reduce((acc, itemKey) => {
      const item = cartItems.find((item) => item.key === itemKey);
      if (item) {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0);
  };

  const updateQuantity = async (itemKey, newQuantity) => {
    const auth = getAuth();
    const uid = auth.currentUser.uid;
    const db = getDatabase();
    const itemRef = ref(db, `users/${uid}/cart/${itemKey}`);

    try {
      await update(itemRef, { quantity: newQuantity });
      setCartItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.key === itemKey) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      Alert.alert('Error', 'Failed to update item quantity. Please try again later.');
    }
  };

  const incrementQuantity = (itemKey) => {
    const item = cartItems.find((item) => item.key === itemKey);
    if (item) {
      updateQuantity(itemKey, item.quantity + 1);
    }
  };

  const decrementQuantity = (itemKey) => {
    const item = cartItems.find((item) => item.key === itemKey);
    if (item && item.quantity > 1) {
      updateQuantity(itemKey, item.quantity - 1);
    }
  };

  const removeItem = async (itemKey) => {
    const auth = getAuth();
    const uid = auth.currentUser.uid;
    const db = getDatabase();
    const itemRef = ref(db, `users/${uid}/cart/${itemKey}`);

    try {
      await remove(itemRef);
      setCartItems((prevItems) => prevItems.filter((item) => item.key !== itemKey));
      setSelectedItems((prevSelectedItems) => prevSelectedItems.filter((key) => key !== itemKey));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart. Please try again later.');
    }
  };

  const toggleSelectItem = (itemKey) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemKey)) {
        return prevSelectedItems.filter((key) => key !== itemKey);
      } else {
        return [...prevSelectedItems, itemKey];
      }
    });
  };

  const isSelected = (itemKey) => selectedItems.includes(itemKey);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Warning', 'No items selected.');
    } else {
      navigation.navigate('Checkout', { selectedItems });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.cartItemsContainer}>
        {cartItems.map((item) => (
          <View key={item.key} style={styles.cartItem}>
            <TouchableOpacity onPress={() => toggleSelectItem(item.key)}>
              <Icon
                name={isSelected(item.key) ? 'check-square' : 'square-o'}
                size={24}
                color="#009BE2"
                style={styles.checkbox}
              />
            </TouchableOpacity>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.itemQuantityLabel}>Quantity: </Text>
                <TouchableOpacity onPress={() => decrementQuantity(item.key)} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.itemQuantity}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => incrementQuantity(item.key)} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(item.key)} style={styles.removeButton}>
                  <Icon name="trash" size={24} color="#f00" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${getTotalPrice().toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, selectedItems.length === 0 && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#000" />
          <Text style={styles.navTextMain}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Order')}>
          <Icon name="file-text-o" size={22} color="#fff" />
          <Text style={styles.navText}>Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Account')}>
          <Icon name="user" size={24} color="#fff" />
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 70,
  },
  cartItemsContainer: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  checkbox: {
    marginRight: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: '#888',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  itemQuantityLabel: {
    fontSize: 16,
  },
  itemQuantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  quantityButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#009BE2',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderTopColor: '#fff',
    backgroundColor: '#3ABEF9',
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTextMain: {
    fontSize: 12,
    color: '#000',
  },
  navText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default CartScreen;
