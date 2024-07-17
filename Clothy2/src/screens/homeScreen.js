import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, 
  Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getDatabase, ref, onValue } from 'firebase/database';

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const categories = ['ALL', 'T-Shirt', 'Celana', 'Dress', 'Jaket', 'Sepatu', 'Aksesoris'];
  const [filter, setFilter] = useState(categories[0]);
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);

  useEffect(() => {
    const fetchProducts = () => {
      const db = getDatabase();
      const productsRef = ref(db, 'products');

      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productList = Object.keys(data).reduce((accumulator, category) => {
            accumulator.push(...Object.keys(data[category]).map((key) => ({
              id: key,
              ...data[category][key],
              category: category,
            })));
            return accumulator;
          }, []);
          setOriginalItems(productList);
          setItems(productList);
        } else {
          setItems([]);
          setOriginalItems([]);
          console.log('No products found.');
        }
      }, (error) => {
        console.error('Error fetching products:', error);
      });
    };
  
    fetchProducts();
  }, []);

  const shuffleItems = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  useEffect(() => {
    if (filter === 'ALL') {
      setItems(shuffleItems([...originalItems]));
    } else {
      setItems(originalItems.filter(item => item.category === filter));
    }
  }, [filter, originalItems]);

  const handleFilterSelect = (category) => {
    setFilter(category);
    setModalVisible(false);
  };

  const handleSearchSubmit = () => {
    console.log('Search submitted:', search);
    const searchTerm = search.toLowerCase();
    const searchResults = originalItems.filter(item => item.name.toLowerCase().includes(searchTerm));
    setItems(searchResults);
  };

  const handleClearSearch = () => {
    setSearch('');
    setItems(originalItems);
  };

  const filteredItems = filter === 'ALL' ? items : items.filter(item => item.category === filter);

  return (
    <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}>
      <View style={styles.searchFilterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity onPress={handleSearchSubmit}>
          <View style={styles.searchIconContainer}>
            <Icon name="search" size={28} color="#000" />
          </View>
        </TouchableOpacity>
        {search !== '' && (
          <TouchableOpacity onPress={handleClearSearch}>
            <View style={styles.clearIconContainer}>
              <Icon name="times" size={28} color="#000" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilihan Belanja</Text>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.modalItem} onPress={() => handleFilterSelect(category)}>
                <Text style={styles.modalItemText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.categoryButton, filter === category && styles.categoryButtonActive]} 
            onPress={() => handleFilterSelect(category)}
          >
            <Text style={[styles.categoryText, filter === category && styles.categoryTextActive]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.itemsContainer}>
        <View style={styles.itemsRow}>
          {filteredItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.item} onPress={() => navigation.navigate('Product', { product: item })}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              {item.price !== undefined ? (
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              ) : (
                <Text style={styles.itemPrice}>Price not available</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#000" />
          <Text style={styles.navTextMain}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#fff" />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Order')}>
          <Icon name="file-text-o" size={22} color="#fff" />
          <Text style={styles.navText}>Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Account')}>
          <Icon name="user" size={24} color="#fff" />
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '6%',
    paddingBottom: 70, 
    backgroundColor: '#fff',
  },

  // SEARCH & FILTER
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 2,
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 10,
    paddingHorizontal: 8,
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconContainer: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 18,
  },

  // NAVBAR
  categoryContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  categoryButton: {
    backgroundColor: 'lightgrey',
    paddingVertical: 10, 
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40, 
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: 'black',
  },
  categoryText: {
    color: 'black',
    fontSize: 15,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#fff', 
  },

  // ITEMS
  itemsContainer: {
    marginTop: 20,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '47%', 
    marginBottom: 20,
    paddingBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  itemName: {
    fontSize: 16,
    marginVertical: 10,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
  },

  // BOTTOM NAV
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

export default HomeScreen;
