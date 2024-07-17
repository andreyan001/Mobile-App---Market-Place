import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { ref, push, set } from 'firebase/database';
import { database, storage } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddProduct = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // Store image information
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('T-Shirt'); // Default category

  const categories = ['T-Shirt', 'Celana', 'Dress', 'Jaket', 'Hoodie', 'Sepatu', 'Aksesoris'];

  const handleAddProduct = async () => {
    const categoryRef = ref(database, `products/${category}`);
    const newProductRef = push(categoryRef);
    const newProductId = newProductRef.key;

    let imageUrl = image;
    if (image && image.startsWith('file://')) {
      try {
        imageUrl = await uploadImage(image, newProductId);
        setImage(imageUrl); // Update state image dengan URL yang diunggah
      } catch (error) {
        console.log('Image upload error:', error);
        Alert.alert('Error', error.message);
        return;
      }
    }

    const product = {
      id: newProductId,
      name: name,
      price: parseFloat(price),
      image: imageUrl || '',
      description: description,
      category: category,
    };

    set(newProductRef, product)
      .then(() => {
        Alert.alert('Success', 'Product added successfully!');
        navigation.navigate('Admin Home'); 
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to add product: ' + error.message);
      });
  };

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    } else {
      console.log('Image selection cancelled');
    }
  };

  const uploadImage = async (uri, productId) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageReference = storageRef(storage, `product_images/${productId}`);
      await uploadBytes(storageReference, blob);
      const downloadURL = await getDownloadURL(storageReference);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price:</Text>
        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Description"
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            style={styles.picker}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.imagePickerContainer}>
        <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
          <Text style={styles.imagePickerButtonText}>Select Image</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
        <Text style={styles.addButtonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: '30%',
    fontSize: 16,
  },
  input: {
    width: '70%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  pickerContainer: {
    width: '70%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  imagePickerButton: {
    backgroundColor: '#009BE2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginLeft: 40,
  },
  addButton: {
    backgroundColor: '#009BE2',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddProduct;
