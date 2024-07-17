import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from '../component/AuthContext';
import { auth, database } from '../config/firebase'; 
import { signOut } from 'firebase/auth';
import { get, ref } from 'firebase/database';

const fetchUserProfileFromDatabase = async (uid) => {
  try {
    const userRef = ref(database, `users/${uid}/profile`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No data available');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

const AdminAccount = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userProfile = await fetchUserProfileFromDatabase(user.uid);
        if (userProfile) {
          setUsername(userProfile.username || 'Guest');
          setProfileImage(userProfile.image || 'https://via.placeholder.com/150');
        } else {
          setUsername('Guest');
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Signed out successfully');
      navigation.navigate('Login'); 
    } catch (err) {
      Alert.alert('Error signing out:', err.message);
    }
  };

  const openWhatsApp = () => {
    const whatsappNumber = '+62 82281709860';
    const message = 'Halo, saya membutuhkan bantuan dengan aplikasi Anda.'; 
    const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Gagal membuka WhatsApp. Pastikan aplikasi WhatsApp terinstal di perangkat Anda.');
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: profileImage }} 
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user ? username : 'Guest'}</Text>
          <Text style={styles.profileEmail}>{user ? user.email : 'guest@example.com'}</Text>
        </View>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.changeProfile} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.changeProfileText}>Profile</Text>
        </TouchableOpacity>

        <View style={styles.buttonGroup}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Address')}>
              <Text style={styles.buttonText}>Address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={openWhatsApp}>
              <Text style={styles.buttonText}>Helpdesk</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Image
          source={require('../../assets/bg.png')}
          style={styles.randomImage}
        />

        <TouchableOpacity style={styles.authButton} onPress={user ? handleSignOut : () => navigation.navigate('Login')}>
          <Text style={styles.authButtonText}>{user ? 'Logout' : 'Login'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Home')}>
          <Icon name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Product')}>
          <Icon name="cube" size={22} color="#fff" />
          <Text style={styles.navText}>Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Order')}>
          <Icon name="file-text-o" size={22} color="#fff" />
          <Text style={styles.navText}>Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Account')}>
          <Icon name="user" size={24} color="#000" />
          <Text style={styles.navTextMain}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 70,
  },
  contentContainer: {
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 75,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 15,
    color: '#888',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  changeProfile: {
    backgroundColor: '#009BE2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  changeProfileText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonGroup: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#009BE2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
  },
  randomImage: {
    width: '100%',
    height: 150,
    marginVertical: 25,
    borderRadius: 5,
  },
  authButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    top: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
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

export default AdminAccount;
