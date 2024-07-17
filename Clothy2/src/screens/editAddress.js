import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, set, get, child, update } from 'firebase/database';
import { auth } from '../config/firebase';

const EditAddress = ({ route, navigation }) => {
    const { addressId } = route.params;
    const [provinsi, setProvinsi] = useState('');
    const [kabupaten, setKabupaten] = useState('');
    const [kecamatan, setKecamatan] = useState('');
    const [kelurahan, setKelurahan] = useState('');
    const [detail, setDetail] = useState('');
    const [kodepos, setKodePos] = useState('');

    useEffect(() => {
        const fetchAddress = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const dbRef = ref(getDatabase());
                try {
                    const snapshot = await get(child(dbRef, `users/${currentUser.uid}/addresses/${addressId}`));
                    if (snapshot.exists()) {
                        const addressData = snapshot.val();
                        setProvinsi(addressData.provinsi);
                        setKabupaten(addressData.kabupaten);
                        setKecamatan(addressData.kecamatan);
                        setKelurahan(addressData.kelurahan);
                        setDetail(addressData.detail);
                        setKodePos(addressData.kodepos);
                    }
                } catch (error) {
                    console.error('Error fetching address:', error);
                }
            }
        };

        fetchAddress();
    }, [addressId]);

    const handleSave = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const address = {
                provinsi,
                kabupaten,
                kecamatan,
                kelurahan,
                detail,
            };

            const db = getDatabase();
            try {
                const addressRef = ref(db, `users/${currentUser.uid}/addresses/${addressId}`);
                await update(addressRef, address);
                Alert.alert('Success', 'Alamat berhasil diperbarui', [
                    { text: 'OK', onPress: () => navigation.navigate('Address') }
                ]);
            } catch (error) {
                console.error('Error updating address:', error);
                Alert.alert('Error', 'Gagal memperbarui alamat. Silakan coba lagi.');
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

export default EditAddress;
