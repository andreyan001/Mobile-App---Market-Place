import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getDatabase, ref, get, child, update, remove } from 'firebase/database';
import { auth } from '../config/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const AddressScreen = ({ navigation }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const dbRef = ref(getDatabase());
                try {
                    const snapshot = await get(child(dbRef, `users/${currentUser.uid}/addresses`));
                    if (snapshot.exists()) {
                        const addressesData = snapshot.val();
                        const addressesArray = Object.keys(addressesData).map(key => ({
                            id: key,
                            ...addressesData[key]
                        }));
                        setAddresses(addressesArray);

                        const defaultAddress = addressesArray.find(address => address.isDefault);
                        if (defaultAddress) {
                            setSelectedAddressId(defaultAddress.id);
                        } else {
                            setSelectedAddressId(null);
                        }
                    } else {
                        setAddresses([]);
                        setSelectedAddressId(null);
                    }
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                }
            }
        };

        fetchAddresses();
    }, []);

    const updateDefaultAddress = async (addressId) => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const db = getDatabase();
            try {
                const updates = {};
                addresses.forEach(address => {
                    updates[`users/${currentUser.uid}/addresses/${address.id}/isDefault`] = (address.id === addressId);
                });
                await update(ref(db), updates);
                setSelectedAddressId(addressId);
            } catch (error) {
                console.error('Error updating default address:', error);
                Alert.alert('Error', 'Failed to set default address. Please try again.');
            }
        }
    };

    const handleAddAddress = async () => {
        navigation.navigate('Detail Address');
    };

    const handleEditAddress = (addressId) => {
        navigation.navigate('Edit Address', { addressId });
    };

    const handleDeleteAddress = async (addressId) => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const db = getDatabase();
            try {
                await remove(ref(db, `users/${currentUser.uid}/addresses/${addressId}`));
                const updatedAddresses = addresses.filter(address => address.id !== addressId);
                
                // Ensure at least one address is selected
                if (selectedAddressId === addressId && updatedAddresses.length > 0) {
                    setSelectedAddressId(updatedAddresses[0].id);
                    updateDefaultAddress(updatedAddresses[0].id);
                } else {
                    setSelectedAddressId(null); // No default address selected
                }

                setAddresses(updatedAddresses);
            } catch (error) {
                console.error('Error deleting address:', error);
                Alert.alert('Error', 'Failed to delete address. Please try again.');
            }
        }
    };

    const handleSelectAddress = async (addressId) => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                if (addressId === selectedAddressId) {
                    // Deselect the current address (set to null)
                    await updateDefaultAddress(null);
                } else {
                    // Select the new address
                    await updateDefaultAddress(addressId);
                }
            } catch (error) {
                console.error('Error selecting address:', error);
                Alert.alert('Error', 'Failed to select address. Please try again.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.addressContainer}>
                        <TouchableOpacity onPress={() => handleSelectAddress(item.id)} style={styles.checkboxContainer}>
                            <Icon
                                name={selectedAddressId === item.id ? "check-square" : "square-o"}
                                size={24}
                                color="#000"
                            />
                        </TouchableOpacity>
                        <Text style={styles.addressText}>
                            {`${item.detail}, ${item.kelurahan}, ${item.kecamatan}, ${item.kabupaten}, ${item.provinsi}, ${item.kodepos}`}
                        </Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity onPress={() => handleEditAddress(item.id)} style={styles.actionButton}>
                                <Icon name="edit" size={24} color="#009BE2" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteAddress(item.id)} style={styles.actionButton}>
                                <Icon name="trash" size={24} color="#e33057" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                <Text style={styles.addButtonText}>Tambahkan Alamat</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    checkboxContainer: {
        marginRight: 16,
    },
    addressText: {
        fontSize: 16,
        color: '#555',
        flex: 1,
        flexWrap: 'wrap',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 16,
    },
    addButton: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#009BE2',
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default AddressScreen;
