import React, { useContext, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing, Dimensions, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CartContext } from '../component/CartContext';
import { getDatabase, ref, push, set, get, child, update } from 'firebase/database';
import { getAuth } from 'firebase/auth'; 

const { width, height } = Dimensions.get('window');

const ProductScreen = ({ route, navigation }) => {
    const { product } = route.params;
    const { addToCart } = useContext(CartContext); 
    const [quantity, setQuantity] = useState(1);

    const imageScale = useRef(new Animated.Value(1)).current;
    const imageTranslateX = useRef(new Animated.Value(0)).current;
    const imageTranslateY = useRef(new Animated.Value(0)).current;

    const cartIconX = width - 40;
    const cartIconY = 30;

    const handleAddToCart = async () => {
        const auth = getAuth();
        const uid = auth.currentUser.uid;
        const db = getDatabase();
        const cartRef = ref(db, `users/${uid}/cart`);
        
        try {
            const cartSnapshot = await get(cartRef);
            let productExists = false;

            if (cartSnapshot.exists()) {
                cartSnapshot.forEach((childSnapshot) => {
                    const cartItem = childSnapshot.val();
                    if (cartItem.id === product.id) {
                        productExists = true;
                        const newQuantity = cartItem.quantity + quantity;
                        update(ref(db, `users/${uid}/cart/${childSnapshot.key}`), { quantity: newQuantity });
                    }
                });
            }

            if (!productExists) {
                const productWithQuantity = { ...product, quantity };
                push(cartRef, productWithQuantity);
            }

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(imageScale, {
                        toValue: 0.1,
                        duration: 500,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(imageTranslateX, {
                        toValue: width / 2 - 40,
                        duration: 500,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(imageTranslateY, {
                        toValue: -height / 2 + 150,
                        duration: 500,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(imageTranslateX, {
                        toValue: cartIconX - (width / 2 - 1200),
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(imageTranslateY, {
                        toValue: cartIconY - (height / 2 + 900),
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(imageScale, {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                imageScale.setValue(1);
                imageTranslateX.setValue(0);
                imageTranslateY.setValue(0);
            });

            console.log('Product added/updated in cart in Firebase');
        } catch (error) {
            Alert.alert('Error', 'Failed to add/update product in cart. Please try again later.');
        }
    };

    // Fungsi untuk membuka WhatsApp dengan pesan tertentu
    const openWhatsApp = () => {
        const whatsappNumber = '+62 82281709860';
        const message = 'Halo, saya membutuhkan bantuan dengan aplikasi Anda.';
        const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Gagal membuka WhatsApp. Pastikan aplikasi WhatsApp terinstal di perangkat Anda.');
        });
    };
    const incrementQuantity = () => {
        setQuantity(quantity + 1);
    };
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.imageContainer}>
                    <Animated.Image
                        source={{ uri: product.image }}
                        style={[
                            styles.productImage,
                            {
                                transform: [
                                    { scale: imageScale },
                                    { translateX: imageTranslateX },
                                    { translateY: imageTranslateY },
                                ],
                            },
                        ]}
                    />
                    <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Cart')}>
                        <Icon name="shopping-cart" size={24} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.quantityContainer}>
                        <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.productDetails}>
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDescription}>{product.description}</Text>
                    <View style={styles.productRate}>
                        <Icon name="star" size={20} color="#f0c14b" />
                        <Icon name="star" size={20} color="#f0c14b" />
                        <Icon name="star" size={20} color="#f0c14b" />
                        <Icon name="star" size={20} color="#f0c14b" />
                        <Icon name="star-half" size={20} color="#f0c14b" />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                    <Text style={styles.buttonText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton}>
                    <Text style={styles.buttonText} onPress={openWhatsApp}>Chat</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
    },
    imageContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    productImage: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        borderRadius: 20,
    },
    cartIcon: {
        position: 'absolute',
        top: 10,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 10,
        padding: 10,
    },
    productDetails: {
        marginTop: 20,
        padding: 10,
    },
    productPrice: {
        fontSize: 24,
        width: '50%',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    productDescription: {
        fontSize: 16,
        marginBottom: 10,
    },
    productRate: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    quantityContainer: {
        position: 'absolute',
        top: 320,
        right: 10, 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    quantityButton: {
        backgroundColor: '#ccc',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantity: {
        fontSize: 16,
        marginHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    addButton: {
        backgroundColor: '#009BE2',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        flex: 3,
        marginRight: 5,
    },
    chatButton: {
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        marginLeft: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductScreen;
