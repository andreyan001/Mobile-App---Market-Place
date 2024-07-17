import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const UserOrders = ({ route }) => {
  const { userKey } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = ref(database, `users/${userKey}/orders`);
        const snapshot = await get(ordersRef);
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const formattedOrders = Object.keys(ordersData).map(key => ({
            key,
            ...ordersData[key]
          }));
          setOrders(formattedOrders);
        } else {
          console.log('No orders found for this user.');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userKey]);

  const navigateToOrderDetail = (order) => {
    navigation.navigate('Detaill Order', { order, userKey });
  };

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
          <Text>No orders found for this user.</Text>
        ) : (
          orders.map(order => (
            <TouchableOpacity
              key={order.key}
              style={styles.orderItem}
              onPress={() => navigateToOrderDetail(order)} // Navigasi ke detail order saat item ditekan
            >
              <View style={styles.orderContent}>
                <Image source={{ uri: order.items[Object.keys(order.items)[0]].image }} style={styles.orderItemImage} />
                <View style={styles.orderText}>
                  <Text style={styles.orderId}>Order ID: {order.key}</Text>
                  <Text style={styles.orderStatus}>Status: {order.status || 'Waiting'}</Text>
                  <Text style={styles.orderTotal}>Total: ${order.total.toFixed(2)}</Text>
                </View>
                {!order.status && (
                  <View style={styles.dot} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  orderText: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 14,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    position: 'absolute',
    top: 5,
    right: 5,
  },
});

export default UserOrders;
