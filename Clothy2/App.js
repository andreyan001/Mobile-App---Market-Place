import React, { useContext, useEffect } from 'react';
import './src/config/firebase';
import 'react-native-gesture-handler';
import { useNavigation, NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/homeScreen';
import LoginScreen from './src/screens/loginScreen';
import RegisterScreen from './src/screens/registerScreen';
import ProductScreen from './src/screens/productScreen';
import CartScreen from './src/screens/cartScreen';
import CheckoutScreen from './src/screens/checkoutScreen';
import OrderScreen from './src/screens/orderScreen';
import OrderDetailScreen from './src/screens/orderDetailScreen';
import AccountScreen from './src/screens/accountScreen';
import ProfileScreen from './src/screens/profileScreen';
import AddressScreen from './src/screens/addressScreen';
import AddAddress from './src/screens/addAddress';
import EditAddress from './src/screens/editAddress';

// ADMIN
import AdminHome from './src/admin/homeScreen';
import AdminAccount from './src/admin/accountScreen';
import AdminOrder from './src/admin/orderScreen';
import UsersOrder from './src/admin/orderUsers';
import DetailOrder from './src/admin/orderDetail';
import AdminProduct from './src/admin/productScreen';
import AddProduct from './src/admin/addProduct';
import EditProduct from './src/admin/editProduct';
import DetailProduct from './src/admin/detailProduct';

import Tester from './src/screens/TESTER';
import { CartProvider } from './src/component/CartContext';
import { AuthProvider, AuthContext } from './src/component/AuthContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, role, loading } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && user) {
      // Setelah login berhasil, reset navigasi ke halaman beranda yang sesuai
      const resetAction = CommonActions.reset({
        index: 0,
        routes: [{ name: role === 'admin' ? 'Admin Home' : 'Home' }],
      });
      navigation.dispatch(resetAction);
    }
  }, [loading, user, role]);

  if (loading) {
    return null; // Atau ganti dengan komponen loading spinner
  }

  return (
    <Stack.Navigator initialRouteName={user ? (role === 'admin' ? 'Admin Home' : 'Home') : 'Login'}>
      {/* USERS */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Order" component={OrderScreen} />
      <Stack.Screen name="Detail Order" component={OrderDetailScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="Detail Address" component={AddAddress} />
      <Stack.Screen name="Edit Address" component={EditAddress} />

      {/* ADMIN */}
      <Stack.Screen name="Admin Home" component={AdminHome} />
      <Stack.Screen name="Admin Account" component={AdminAccount} />
      <Stack.Screen name="Admin Order" component={AdminOrder} />
      <Stack.Screen name="Users Order" component={UsersOrder} />
      <Stack.Screen name="Detaill Order" component={DetailOrder} />
      <Stack.Screen name="Admin Product" component={AdminProduct} />
      <Stack.Screen name="Add Product" component={AddProduct} />
      <Stack.Screen name="Edit Product" component={EditProduct} />
      <Stack.Screen name="Detail Product" component={DetailProduct} />

      <Stack.Screen name="TESTER" component={Tester} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
