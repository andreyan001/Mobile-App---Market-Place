import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState([]);
  const navigation = useNavigation();

  const categories = ['ALL', 'T-Shirt', 'Celana', 'Dress', 'Jaket', 'Hoodie', 'Sepatu', 'Aksesoris'];

  useEffect(() => {
    const db = getDatabase();
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = [];
        for (const category in data) {
          for (const productId in data[category]) {
            productList.push({ ...data[category][productId], id: productId, category });
          }
        }
        setProducts(productList);
        setFilteredProducts(productList);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  const toggleSelectItem = (productId) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(productId)) {
        return prevSelectedItems.filter((id) => id !== productId);
      } else {
        return [...prevSelectedItems, productId];
      }
    });
  };

  const isSelected = (productId) => selectedItems.includes(productId);

  const handleEdit = (product) => {
    navigation.navigate('Edit Product', { category: product.category, productId: product.id });
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No Products Selected', 'Please select products to delete.');
      return;
    }

    Alert.alert(
      'Delete Products',
      'Are you sure you want to delete selected products?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            selectedItems.forEach((productId) => {
              const db = getDatabase();
              const productRef = ref(db, `products/${filteredProducts.find(product => product.id === productId).category}/${productId}`);
              remove(productRef)
                .then(() => {
                  console.log(`Product ${productId} deleted successfully.`);
                })
                .catch((error) => {
                  console.error(`Failed to delete product ${productId}:`, error);
                });
            });
            setSelectedItems([]);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Detail Product', { product: item })}>
      <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
        <Icon
          name={isSelected(item.id) ? 'check-square' : 'square-o'}
          size={24}
          color={isSelected(item.id) ? '#009BE2' : '#888'}
          style={styles.checkbox}
        />
      </TouchableOpacity>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
          {item.description}
        </Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Icon name="edit" size={24} color="#009BE2" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryText}>Categories:</Text>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryButton, item === selectedCategory && styles.categoryButtonActive]}
              onPress={() => handleCategorySelect(item)}
            >
              <Text style={[styles.categoryButtonText, item === selectedCategory && styles.categoryButtonTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      {selectedItems.length > 0 && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelected}>
          <Icon name="trash" size={24} color="#f00" />
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Home')}>
          <Icon name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Product')}>
          <Icon name="cube" size={24} color="#000" />
          <Text style={styles.navTextMain}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Admin Order')}>
          <Icon name="file-text-o" size={22} color="#fff" />
          <Text style={styles.navText}>Orders</Text>
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
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#3ABEF9',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  editButton: {
    position: 'relative',
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    elevation: 3,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 80,  // Adjusted to be above the bottom navigation bar
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10, // Ensure the delete button is above other elements
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#3ABEF9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    marginTop: 2,
  },
});

export default ProductScreen;
