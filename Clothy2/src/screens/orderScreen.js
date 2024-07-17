import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { auth, database } from '../config/firebase';
import { ref, get } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';

const OrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = auth.currentUser.uid;
        const ordersRef = ref(database, `users/${userId}/orders`);

        const snapshot = await get(ordersRef);
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const formattedOrders = Object.keys(ordersData).map(key => {
            const order = ordersData[key];
            const itemImages = order.items 
              ? Object.keys(order.items).map(itemKey => order.items[itemKey].image)
              : [];
            return { key, ...order, itemImages };
          });
          setOrders(formattedOrders);
        } else {
          console.log('No orders available');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {orders.length === 0 ? (
          <Text>No orders found.</Text>
        ) : (
          orders.map((order) => (
            <TouchableOpacity key={order.key} style={styles.orderItem} onPress={() => navigation.navigate('Detail Order', { order })}>
              <View style={styles.orderDetails}>
                {order.itemImages && order.itemImages.length > 0 && (
                  <Image source={{ uri: order.itemImages[0] }} style={styles.orderImage} />
                )}
                <View style={styles.orderInfo}>
                  <Text style={styles.orderHeader}>Order ID: {order.key}</Text>
                  <Text>Total: ${order.total.toFixed(2)}</Text>
                  <Text>Payment Method: {order.paymentMethod}</Text>
                  <Text>Status: {order.status || 'Waiting'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#fff" />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Order')}>
          <Icon name="file-text-o" size={22} color="#000" />
          <Text style={styles.navTextMain}>Order</Text>
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingBottom: 70, 
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  orderDetails: {
    flexDirection: 'row',
  },
  orderImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
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

export default OrderScreen;
