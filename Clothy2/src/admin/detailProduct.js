import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions, Alert } from 'react-native';
import { getDatabase, ref, remove } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const DetailProduct = ({ route, navigation }) => {
    const { product } = route.params;
    
    const imageScale = useRef(new Animated.Value(1)).current;
    const imageTranslateX = useRef(new Animated.Value(0)).current;
    const imageTranslateY = useRef(new Animated.Value(0)).current;

    const handleDeleteProduct = () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        const db = getDatabase();
                        const productRef = ref(db, `products/${product.category}/${product.id}`);
                        remove(productRef)
                            .then(() => {
                                console.log(`Product ${product.id} deleted successfully.`);
                                navigation.goBack(); // Navigate back to the previous screen after deletion
                            })
                            .catch((error) => {
                                console.error(`Failed to delete product ${product.id}:`, error);
                            });
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
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
                </View>
                <View style={styles.productDetails}>
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDescription}>{product.description}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProduct}>
                            <Text style={styles.buttonText}>Hapus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('Edit Product', { category: product.category, productId: product.id })}>
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    productDetails: {
        marginTop: 20,
        padding: 10,
    },
    productPrice: {
        fontSize: 24,
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
        marginBottom: 30, 
    },
    buttonContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#FF0000',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '45%',
    },
    editButton: {
        backgroundColor: '#009BE2',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '45%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DetailProduct;
