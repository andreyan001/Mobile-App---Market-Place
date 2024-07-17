import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, set } from 'firebase/database';
import { auth } from '../config/firebase';

const AddAddress = ({ navigation }) => {
    const [provinsi, setProvinsi] = useState('');
    const [kabupaten, setKabupaten] = useState('');
    const [kecamatan, setKecamatan] = useState('');
    const [kelurahan, setKelurahan] = useState('');
    const [detail, setDetail] = useState('');
    const [kodepos, setKodePos] = useState('');

    const handleSave = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const address = {
                provinsi,
                kabupaten,
                kecamatan,
                kelurahan,
                detail,
                kodepos,
            };

            const db = getDatabase();
            try {
                const newAddressRef = ref(db, `users/${currentUser.uid}/addresses/${new Date().getTime()}`);
                await set(newAddressRef, address);
                Alert.alert('Success', 'Alamat berhasil ditambahkan', [
                    { text: 'OK', onPress: () => navigation.navigate('Address') }
                ]);
            } catch (error) {
                console.error('Error saving address:', error);
                Alert.alert('Error', 'Gagal menyimpan alamat. Silakan coba lagi.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Detail Alamat"
                value={detail}
                onChangeText={setDetail}
            />
            <TextInput
                style={styles.input}
                placeholder="Kelurahan / Desa"
                value={kelurahan}
                onChangeText={setKelurahan}
            />
            <TextInput
                style={styles.input}
                placeholder="Kecamatan"
                value={kecamatan}
                onChangeText={setKecamatan}
            />
            <TextInput
                style={styles.input}
                placeholder="Kabupaten / Kota"
                value={kabupaten}
                onChangeText={setKabupaten}
            />
            <TextInput
                style={styles.input}
                placeholder="Provinsi"
                value={provinsi}
                onChangeText={setProvinsi}
            /> 
            <TextInput
                style={styles.input}
                placeholder="Kode Pos"
                value={kodepos}
                onChangeText={setKodePos}
            />
            <Button title="Simpan Alamat" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
});

export default AddAddress;
