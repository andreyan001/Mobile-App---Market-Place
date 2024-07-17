import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const OrderDetailScreen = ({ route }) => {
  const { order } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order ID: {order.key}</Text>
      <ScrollView style={styles.scrollContainer}>
        {order.items && Object.keys(order.items).map(itemKey => {
          const item = order.items[itemKey];
          return (
            <View key={itemKey} style={styles.itemContainer}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>Price: ${item.price.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.orderSummary}>
        <Text style={styles.summaryText}>Total: ${order.total.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Payment Method: {order.paymentMethod}</Text>
        <Text style={styles.summaryText}>Status: {order.status || 'Waiting'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
  },
  orderSummary: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default OrderDetailScreen;
