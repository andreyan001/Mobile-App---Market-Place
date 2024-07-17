import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDatabase, ref, get, child, set } from 'firebase/database';
import { auth, storage } from '../config/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { updatePassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [numberPhone, setNumberPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        setUser(currentUser);
        if (currentUser) {
            setEmail(currentUser.email);
            const dbRef = ref(getDatabase());
            get(child(dbRef, `users/${currentUser.uid}/profile`)).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setNumberPhone(userData.numberPhone);
                    setName(userData.name);
                    setUsername(userData.username);
                    setPassword(userData.password);
                    setImage(userData.image || null);
                }
            }).catch((error) => {
                console.error('Error fetching user data:', error);
            });
        }
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            console.log('Image selected:', result.assets[0].uri);
            setImage(result.assets[0].uri);
        } else {
            console.log('Image selection cancelled');
        }
    };

    const uploadImage = async (uri, userId) => {
        console.log('Uploading image...', uri);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageReference = storageRef(storage, `profile_images/${userId}`);
            await uploadBytes(storageReference, blob);
            const downloadURL = await getDownloadURL(storageReference);
            console.log('Image uploaded. URL:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSave = async () => {
        const currentUser = auth.currentUser;

        if (currentUser) {
            console.log('Saving profile...');
            if (isChangingPassword) {
                if (!newPassword || !confirmPassword) {
                    Alert.alert('Error', 'Please enter both new and confirm passwords');
                    return;
                }
                if (newPassword.length < 6) {
                    Alert.alert('Error', 'Password should be at least 6 characters');
                    return;
                }
                if (newPassword !== confirmPassword) {
                    Alert.alert('Error', 'Passwords do not match');
                    return;
                }
                try {
                    await updatePassword(currentUser, newPassword);
                    setPassword(newPassword); // Update local state to reflect the new password
                    Alert.alert('Success', 'Password updated successfully');
                } catch (error) {
                    console.log('Password update error:', error);
                    if (error.code === 'auth/requires-recent-login') {
                        Alert.alert('Error', 'Please log in again to update your password.');
                        await signOut(auth);
                        navigation.navigate('Login');
                    } else {
                        Alert.alert('Error', error.message);
                    }
                    return;
                }
            }

            let imageUrl = image;
            if (image && image.startsWith('file://')) {
                try {
                    imageUrl = await uploadImage(image, currentUser.uid);
                    setImage(imageUrl); // Update state image dengan URL yang diunggah
                } catch (error) {
                    console.log('Image upload error:', error);
                    Alert.alert('Error', error.message);
                    return;
                }
            }

            const db = getDatabase();
            set(ref(db, 'users/' + currentUser.uid + '/profile'), {
                image: imageUrl || '',
                name,
                username,
                numberPhone,
                password,
                email: currentUser.email,
            }).then(() => {
                console.log('Profile updated successfully');
                Alert.alert('Success', 'Profile updated successfully');
                setIsEditing(false);
                setIsChangingPassword(false);
                setNewPassword(''); 
                setConfirmPassword(''); 
            }).catch((error) => {
                console.log('Database update error:', error);
                Alert.alert('Error', error.message);
            });
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
                <Image source={image ? { uri: image } : null} style={styles.profileImage} />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
                editable={isEditing}
            />
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                editable={isEditing}
            />
            <TextInput
                style={styles.input}
                placeholder="Number Phone"
                value={numberPhone}
                onChangeText={setNumberPhone}
                editable={isEditing}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                editable={false}
            />
            {isChangingPassword && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!isPasswordVisible}
                        editable={true}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!isPasswordVisible}
                        editable={true}
                    />
                </>
            )}
            {!isChangingPassword && (
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        value={password}
                        secureTextEntry={!isPasswordVisible}
                        editable={false}
                    />
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Icon
                            name={isPasswordVisible ? "eye-slash" : "eye"}
                            size={20}
                            color="#000"
                        />
                    </TouchableOpacity>
                </View>
            )}
            {isEditing && (
                <TouchableOpacity onPress={() => {
                    setIsChangingPassword(!isChangingPassword);
                    setNewPassword('');
                    setConfirmPassword('');
                }}>
                    <Text style={styles.changePasswordText}>
                        {isChangingPassword ? "Cancel" : "Change Password"}
                    </Text>
                </TouchableOpacity>
            )}
            <Button title={isEditing ? "Save" : "Edit"} onPress={isEditing ? handleSave : () => setIsEditing(true)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        backgroundColor: '#ccc', // Background default jika tidak ada gambar
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    passwordInput: {
        flex: 1,
        padding: 10,
    },
    changePasswordText: {
        color: '#007BFF',
        textAlign: 'center',
        marginBottom: 10,
        textDecorationLine: 'underline',
    },
});

export default ProfileScreen;
