import React from 'react';
import { View, Text, StyleSheet, Button, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const About = () => {
  const handleClearData = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Data Cleared');
    } catch (e) {
      console.log('Error clear data: in about.js');
      console.error(e);
    }
  };

  const createClearDataAlert = () => {
    Alert.alert(
      'Menghapus Data',
      'Apakah anda benar-benar ingin menghapus data anda?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          style: 'default',
          onPress: handleClearData,
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>About</Text>
      <Text style={styles.title}>About This Application</Text>
      <Text style={styles.content}>
        Aplikasi ini dirancang sebagai studi kasus untuk pembelajaran mata
        kuliah Pemrograman Mobile Program Studi Informatika Institut Teknologi
        Telkom Surabaya
      </Text>
      <Text
        style={{ marginBottom: 5 }}
        onPress={() =>
          Linking.openURL(
            'https://www.freepik.com/icon/task-list_9329651#fromView=search&term=todo+list&page=1&position=1&track=ais'
          ).catch((err) => console.error('Error', err))
        }
      >
        Icon by Azland Studio (Freepik)
      </Text>
      <Text
        style={{ marginBottom: 15 }}
        onPress={() =>
          Linking.openURL('https://github.com/fzl-22').catch((err) =>
            console.error('Error', err)
          )
        }
      >
        Developed by Ahmad Mu'min Faisal (1203210101)
      </Text>

      <Button
        style={{ marginTop: 15 }}
        title="Clear Data"
        onPress={createClearDataAlert}
      ></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 7,
    color: 'blue',
  },
  content: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default About;
