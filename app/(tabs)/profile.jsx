import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [userName, setUserName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      setUserName(storedName || 'User');
      const contactsJson = await AsyncStorage.getItem('emergency_contacts');
      setContacts(contactsJson ? JSON.parse(contactsJson) : []);
    };
    loadProfile();
  }, []);

  const handleAddContact = async () => {
    if (!name || !phone || !email) {
      Alert.alert('Incomplete', 'Please fill all fields.');
      return;
    }
    const newContact = { id: Date.now().toString(), name, phone, email };
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    await AsyncStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
    setName(''); setPhone(''); setEmail('');
  };

  const handleDeleteContact = async (id) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    setContacts(updatedContacts);
    await AsyncStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profile</Text>
      <Text style={styles.profileName}>{userName}</Text>
      <Text style={styles.sectionTitle}>Add Emergency Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number (e.g., +1234567890)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Emergency Contacts</Text>
      {contacts.length === 0 ? (
        <Text style={styles.noContacts}>No contacts added yet.</Text>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactItem}>
              <FontAwesome5 name="user-alt" size={20} color="#FF6347" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactDetail}>{item.phone}</Text>
                <Text style={styles.contactDetail}>{item.email}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteContact(item.id)}>
                <FontAwesome5 name="trash" size={18} color="#FF6347" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 40,
    color: '#222',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#FF6347',
  },
  input: {
    height: 48,
    borderColor: '#FF6347',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noContacts: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  contactDetail: {
    fontSize: 14,
    color: '#555',
  },
});
