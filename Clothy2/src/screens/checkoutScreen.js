import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CartContext } from '../component/CartContext';
import { auth, database } from '../config/firebase'; // Import Firebase
import { ref, push, set, get, update } from 'firebase/database';
import { CommonActions } from '@react-navigation/native';

const CheckoutScreen = ({ route, navigation }) => {
  const { cartItems, setCartItems, addCompletedOrder } = useContext(CartContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Transfer');
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null); // State untuk data pengguna
  const [defaultAddress, setDefaultAddress] = useState(null); // State untuk data alamat default
  const [loading, setLoading] = useState(true); // State untuk status loading

  useEffect(() => {
    if (route.params?.selectedItems) {
      setSelectedItems(route.params.selectedItems);
    }
  }, [route.params?.selectedItems]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser.uid;
        const userRef = ref(database, `users/${userId}/profile`);

        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          console.log('No user data available');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Fungsi untuk mengambil data alamat default dari Firebase Realtime Database
    const fetchDefaultAddress = async () => {
      try {
        const userId = auth.currentUser.uid;
        const userAddressesRef = ref(database, `users/${userId}/addresses`);

        const snapshot = await get(userAddressesRef);
        if (snapshot.exists()) {
          const addressesData = snapshot.val();

          // Temukan alamat default
          const defaultAddressId = Object.keys(addressesData).find(key => addressesData[key].isDefault);
          if (defaultAddressId) {
            setDefaultAddress(addressesData[defaultAddressId]);
          } else {
            console.log('No default address found');
          }
        } else {
          console.log('No address data available');
        }
      } catch (error) {
        console.error('Error fetching default address:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchDefaultAddress();
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

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setModalVisible(false);
  };

  const handleCompletePurchase = async () => {
    // Check if user data exists
    if (!userData || !userData.name || !userData.numberPhone) {
      // Alert user to fill in profile details
      Alert.alert(
        'Incomplete Profile',
        'Please fill in your name and phone number in your profile before proceeding with the purchase.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Profile') },
        ],
      );
      return;
    }
  
    if (!defaultAddress) {
      // Alert user to add address
      Alert.alert(
        'Missing Address',
        'Please add an address in your address page before proceeding with the purchase.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Address') },
        ],
      );
      return;
    }
  
    try {
      const userId = auth.currentUser.uid;
      const ordersRef = ref(database, `users/${userId}/orders`);
      const newOrderRef = push(ordersRef); // Generate a new key for the order
  
      const orderDetails = {
        items: selectedItems.map((itemKey) => {
          const item = cartItems.find((item) => item.key === itemKey);
          return item ? { ...item } : null;
        }).filter(Boolean),
        total: getTotalPrice(),
        paymentMethod,
        address: defaultAddress,
      };
  
      await set(newOrderRef, orderDetails);
  
      const updates = {};
      selectedItems.forEach(itemKey => {
        updates[`users/${userId}/cart/${itemKey}`] = null;
      });
      await update(ref(database), updates);
  
      const remainingCartItems = cartItems.filter((item) => !selectedItems.includes(item.key));
      setCartItems(remainingCartItems); 
  
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Cart' }, 
            { name: 'Order', params: { orderDetails } }
          ]
        })
      );
  
      addCompletedOrder(orderDetails); 
  
    } catch (error) {
      console.error('Error completing purchase:', error);
    }
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
      <Text style={styles.header}>Alamat Pengiriman</Text>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{userData.name} - </Text>
        <Text style={styles.contactPhone}>{userData.numberPhone}</Text>
      </View>
      {!defaultAddress && (
        <TouchableOpacity onPress={() => navigation.navigate('Address')}>
          <Text style={styles.missingAddressText}>Alamat belum ditambahkan</Text>
        </TouchableOpacity>
      )}
      {defaultAddress && (
        <Text style={styles.contactAddress}>
          {`${defaultAddress.detail}, ${defaultAddress.kelurahan}, ${defaultAddress.kecamatan}, ${defaultAddress.kabupaten}, ${defaultAddress.provinsi}, ${defaultAddress.kodepos}`}
        </Text>
      )}
      <ScrollView style={styles.cartItemsContainer}>
        {selectedItems.map((itemKey) => {
          const item = cartItems.find((item) => item.key === itemKey);
          if (!item) {
            return (
              <View key={itemKey} style={styles.cartItem}>
                <Text style={styles.errorText}>Item tidak ditemukan.</Text>
              </View>
            );
          }
          return (
            <View key={item.key} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.paymentMethodSection}>
        <TouchableOpacity
          style={styles.paymentMethodSelector}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.paymentMethodLabel}>
            Metode Pembayaran <Icon name="angle-right" size={16} />
          </Text>
          <Text style={styles.selectedPaymentMethodText}>{paymentMethod}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${getTotalPrice().toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCompletePurchase}>
          <Text style={styles.checkoutButtonText}>Complete Purchase</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Metode Pembayaran</Text>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'Transfer' && styles.selectedPaymentMethod,
              ]}
              onPress={() => handlePaymentMethodChange('Transfer')}
            >
              <View style={styles.paymentMethodContent}>
                <Icon name="bank" size={20} color={paymentMethod === 'Transfer' ? '#fff' : '#000'} />
                <Text style={styles.paymentMethodButtonText}>Transfer</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'COD' && styles.selectedPaymentMethod,
              ]}
              onPress={() => handlePaymentMethodChange('COD')}
            >
              <View style={styles.paymentMethodContent}>
                <Icon name="money" size={20} color={paymentMethod === 'COD' ? '#fff' : '#000'} />
                <Text style={styles.paymentMethodButtonText}>COD</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'E-Wallet' && styles.selectedPaymentMethod,
              ]}
              onPress={() => handlePaymentMethodChange('E-Wallet')}
            >
              <View style={styles.paymentMethodContent}>
                <Icon name="mobile" size={20} color={paymentMethod === 'E-Wallet' ? '#fff' : '#000'} />
                <Text style={styles.paymentMethodButtonText}>E-Wallet</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  contactName: {
    marginRight: 5,
    fontSize: 14,
  },
  contactPhone: {
    fontSize: 14,
  },
  contactAddress: {
    fontSize: 14,
    marginBottom: 20,
  },
  cartItemsContainer: {
    flex: 1,
    marginBottom: 20,
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
  errorText: {
    color: 'red',
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
    fontSize: 16,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#888',
  },
  paymentMethodSection: {
    marginBottom: 20,
  },
  paymentMethodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  paymentMethodLabel: {
    fontSize: 16,
  },
  selectedPaymentMethodText: {
    fontSize: 16,
    color: '#888',
  },
  totalContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5,
  },
  checkoutButton: {
    backgroundColor: '#009BE2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedPaymentMethod: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodButtonText: {
    marginLeft: 10,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
});

export default CheckoutScreen;
