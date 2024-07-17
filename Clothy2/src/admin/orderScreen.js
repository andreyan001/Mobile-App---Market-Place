import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { auth, database } from '../config/firebase';
import { ref, get } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';

const OrderScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setIsAdmin(userData.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };

    if (auth.currentUser) {
      checkAdmin();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const formattedUsers = await Promise.all(Object.keys(usersData).map(async key => {
            const user = usersData[key];
            const ordersRef = ref(database, `users/${key}/orders`);
            const ordersSnapshot = await get(ordersRef);
            const orders = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
            const hasUnconfirmedOrders = Object.values(orders).some(order => !order.status);
            const orderCount = Object.keys(orders).length;
            return { key, ...user, orderCount, hasUnconfirmedOrders };
          }));
          setUsers(formattedUsers.filter(user => user.role !== 'admin'));
        } else {
          console.log('No users available');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const navigateToUserOrders = (userKey) => {
    navigation.navigate('Users Order', { userKey });
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
        {users.length === 0 ? (
          <Text>No users found.</Text>
        ) : (
          users.map((user) => (
            <TouchableOpacity key={user.key} style={styles.userItem} onPress={() => navigateToUserOrders(user.key)}>
              <View>
                <Text style={styles.userName}>{user.profile?.name || 'No Name'}</Text>
                <Text style={styles.orderInfo}>Orders: {user.orderCount}</Text>
                {user.hasUnconfirmedOrders ? (
                  <Text style={styles.unconfirmedOrder}>• Konfirmasi Pesanan</Text>
                ) : (
                  <Text style={styles.doneText}>DONE</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Home')}>
          <Icon name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Product')}>
          <Icon name="cube" size={24} color="#fff" />
          <Text style={styles.navText}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Order')}>
          <Icon name="file-text-o" size={22} color="#000" />
          <Text style={styles.navTextMain}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Account')}>
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
  userItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderInfo: {
    fontSize: 14,
    color: '#333',
  },
  unconfirmedOrder: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 16,
    color: 'green',
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

export default OrderScreen;
