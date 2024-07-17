import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ref, update, onValue, remove, set } from 'firebase/database';
import { database, storage } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const EditProduct = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, productId } = route.params;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [oldImageUrl, setOldImageUrl] = useState('');

  const categories = ['T-Shirt', 'Celana', 'Dress', 'Jaket', 'Hoodie', 'Sepatu', 'Aksesoris'];

  useEffect(() => {
    const getProductData = async () => {
      try {
        const productRef = ref(database, `products/${category}/${productId}`);
        onValue(productRef, (snapshot) => {
          const productData = snapshot.val();
          if (productData) {
            setName(productData.name);
            setPrice(productData.price.toString());
            setImage(productData.image);
            setDescription(productData.description);
            setSelectedCategory(productData.category);
            setOldImageUrl(productData.image); // Save old image URL
          } else {
            console.log('Product data not found');
          }
        });
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    getProductData();
  }, [category, productId]);

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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

  const handleSaveProduct = async () => {
    const productRef = ref(database, `products/${category}/${productId}`);
    let imageUrl = image;

    if (image && image.startsWith('file://')) {
      try {
        imageUrl = await uploadImage(image, productId);
        if (oldImageUrl && oldImageUrl !== imageUrl) {
          const oldImageRef = storageRef(storage, oldImageUrl);
          await deleteObject(oldImageRef);
        }
      } catch (error) {
        console.log('Image upload error:', error);
        Alert.alert('Error', error.message);
        return;
      }
    }

    const updatedProduct = {
      name,
      price: parseFloat(price),
      image: imageUrl,
      description,
      category: selectedCategory,
    };

    if (selectedCategory !== category) {
      // Remove the product from the old category
      await remove(productRef);

      // Add the product to the new category
      const newProductRef = ref(database, `products/${selectedCategory}/${productId}`);
      set(newProductRef, updatedProduct)
        .then(() => {
          Alert.alert('Success', 'Product updated successfully!');
          navigation.goBack();
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to update product: ' + error.message);
        });
    } else {
      // Update the product in the same category
      update(productRef, updatedProduct)
        .then(() => {
          Alert.alert('Success', 'Product updated successfully!');
          navigation.goBack();
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to update product: ' + error.message);
        });
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
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginHorizontal: 60,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#009BE2',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditProduct;
