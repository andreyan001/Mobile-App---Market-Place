import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform,
        Image, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import { auth, database } from '../config/firebase';
import { ref, set } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const registerHandler = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(ref(database, 'users/' + user.uid + '/profile'), {
        username: username,
        email: email,
        password: password,
      });

      Alert.alert('Sukses', 'Registrasi Berhasil', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      if (error.code === 'auth/configuration-not-found') {
        console.error('Firebase Auth configuration not found');
      } else {
        console.error('Firebase Auth error:', error.message);
      }
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Image source={require('../../assets/icon2.png')} style={styles.logo}/>
            <Text style={styles.title}>Hello!</Text>
            <Text style={styles.subtitle}>Register to get started  </Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#aaa"
                value={username}
                onChangeText={setUsername}
            />
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
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.button} onPress={registerHandler}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <View style={styles.loginContainer}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16, 
  },
  
  logo: {
    width: 100,
    height: 100,
    marginBottom: '10%',
  },

  title: {
    fontSize: 25,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },

  subtitle: {
    fontSize: 25,
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
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
  },

  loginContainer: {
    flexDirection: 'row',
    bottom: 20,flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },

  loginText: {
    color: '#0000ff',
    textAlign: 'center',
  },

});

export default RegisterScreen;
