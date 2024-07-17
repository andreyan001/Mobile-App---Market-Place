import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, 
        TouchableOpacity, Image, KeyboardAvoidingView,
        Platform } from 'react-native';
import { auth } from '../config/firebase';
import { ref, get, getDatabase } from 'firebase/database';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginHandler = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const database = getDatabase(); // Inisialisasi database
      const dbRef = ref(database, `users/${user.uid}/role`);
      const snapshot = await get(dbRef);
  
      if (snapshot.exists()) {
        const role = snapshot.val();
        console.log('User role:', role); // Debugging log
        if (role === 'admin') {
          navigation.navigate('Admin Home'); 
        } else {
          navigation.navigate('Home');
        }
      } else {
        console.log('Role not found, navigating to Home'); // Debugging log
        navigation.navigate('Home');
      }
    } catch (err) {
      console.error('Login error:', err); // Debugging log
      setError(err.message);
    }
  };  

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <Image source={require('../../assets/icon2.png')} style={styles.logo}/>
        <Text style={styles.title}>Hello </Text>
        <Text style={styles.subtitle}>Glad to see you.... </Text>

        <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={loginHandler}>
            <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.registerContainer}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },

  logo: {
    width: 100,
    height: 100,
    marginBottom: '15%',
  },

  title: {
    fontSize: 28,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },

  subtitle: {
    fontSize: 28,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginLeft: '10%',
  },

  input: {
    height: 40,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: '#000',
  },

  button: {
    width: '80%',
    backgroundColor: '#009BE2',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
  },

  registerContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
  },

  registerText: {
    color: '#0000ff',
    textAlign: 'center',
  },
});

export default LoginScreen;
