# Modul 7 - React Native Local Storage

| Nama | Ahmad Mu'min Faisal |
| -- | -- |
| NIM | 1203210101 |
| Kelas | IF-01-01 |
| URL Github | https://github.com/fzl-22/react-native-local-storage |

Laporan ini dibuat setelah ditemukannya bug dan dilakukan bug fix serta improvisasi UI. File Laporan berekstensi PDF dapat diakses di [**LAPORAN.pdf**](./LAPORAN.pdf).

## 1 Persiapan

Buat sebuah project Expo dengan perintah berikut:

```bash
npx create-expo-app react-native-local-storage
```

Navigasikan ke direktori tersebut, kemudian install dependency berikut:

```bash
npm install @react-navigation/native # Melakukan navigasi secara native
npm install @react-navigation/native-stack # Melakukan navigasi stack secara native
npm install @react-navigation/bottom-tabs # Membuat bottom tab bar
npm install @react-native-async-storage/async-storage@1.18.2 # Melakukan penyimpanan lokal
```

Setelah itu, jalankan project Expo dengan perintah berikut:

```bash
npm run android
```

## 2 Bug dan Bug Fixing

### 2.1 Bug

Setelah membuat project dengan spesifikasi yang diinstuksikan oleh modul, ditemukanlah sebuah bug pada halaman `TaskCompleted`. Bug ini terjadi saat melakukan penghapusan task yang sudah selesai, yangmana menyebabkan semua task ikut ditampilkan. Untuk lebih jelasnya, berikut adalah cara untuk melakukan reproduce pada bug ini.

1. Buat beberapa task, misalnya 3 task di halaman `TaskAll`.

    ![](./assets/laporan/bug/1.%20created%203%20tasks.png)

2. Tandai salah satu tugas dengan tombol "Done", misalnya "Teknik Kompilator". Maka, task tersebut akan muncul di halaman `TaskCompleted`.

    ![](./assets/laporan/bug/2.%20completed%20one%20task.png)

3. Setelah itu, klik "Delete" pada task "Teknik Kompilator".

    ![](./assets/laporan/bug/3.%20delete%20completed%20task.png)

4. Maka, task lain yang seharusnya belum berstatus "isCompleted" akan ikut ditampilkan. Ini adalah sebuah bug.

    ![](./assets/laporan/bug/4.%20bug,%20all%20remaining%20task%20also%20marked%20as%20completed.png)
  
### 2.2 Bug Fix

#### 2.2.1 Analisis Bug

Untuk mendeteksi bug ini, perhatikan bahwa:

1. Tidak ada masalah pada local storage. Hal ini dibuktikan karena ketika berpindah halaman dan kembali lagi, data yang ditampilkan di halaman `TaskCompleted` sudah benar dan sesuai. Sehingga permasalahannya ada pada state dari halaman `TaskCompleted` 

2. Bug ini terjadi ketika, tombol "Delete" ditekan, sehingga dapat dicurigai bahwa kode yang menyebabkan bug ini dapat diindikasikan berada pada fungsi `handleDeleteTask`.

Melalui 2 analisis di atas, dapat dipersempit pencarian bugnya, yaitu sebagai berikut:

1. Bug berada di halaman `TaskCompleted`.
2. Bug berada di fungsi `handleDeleteTask`.
3. Bug berhubungan dengan state.

#### 2.2.2 Perbaikan Bug

Untuk memperbaiki bug tersebut, perhatikan statement pemanggilan fungsi `setTasks` yang ada pada fungsi `handleDeleteTask`. Argument yang diberikan kepada fungsi `setTasks` tersebut adalah `deletedList` yang berisi **semua task pada list kecuali task yang baru saja dihapus**. Sehingga menyebabkan task lain yang seharusnya tidak berstatus `isCompleted` tetap ditampilkan di layar saat perubahan state. 

```jsx
const handleDeleteTask = async (item, index) => {
    const allList = await getStorageData();
    const deletedList = allList.filter(
        (list, listIndex) => list.title !== item.title
    );
    try {
        AsyncStorage.setItem('@task-list', JSON.stringify(deletedList));
        setTasks(deletedList); // Penyebab bug
    } catch (e) {
        console.log('Error delete task: in task-all.js');
        console.error(e.message);
    }
};
```

Untuk memperbaiki bug tersebut, tampilkan hanya yang berstatus `isCompleted`. Cara disebut dapat dicapai dengan memanggil method `filter` pada `deletedList` dengan kondisi `isCompleted === true`. Dengan ini, hanya task yang sudah selesai yang ditampilkan di layar saat terjadi perubahan state. 

```jsx
const handleDeleteTask = async (item, index) => {
  const allList = await getStorageData();
  const deletedList = allList.filter(
    (list, listIndex) => list.title !== item.title
  );
  try {
    AsyncStorage.setItem('@task-list', JSON.stringify(deletedList));
    setTasks(
      deletedList.filter((list, listIndex) => list.isCompleted === true) // Bug Fixed
    );
  } catch (e) {
    console.log('Error delete task: in task-all.js');
    console.error(e.message);
  }
};
```

## 3 Improvisasi

![](./assets/laporan/improvisation/alert%20clear%20data.png)

Improvisasi yang dilakukan di tugas ini adalah dengan menambahkan Alert dialog saat melakukan penghapusan data. Improvisasi ini dilakukan di halaman `About`, pada saat tombol "Clear Data" ditekan. Hal ini tentu saja akan meningkatkan pengalaman pengguna (*User Experience*) karena data tidak akan langsung terhapus ketika user tidak sengaja menekan tombol tersebut.

Improvisasi ini dilakukan dengan membuat Alert, yaitu dengan menambahkan kode berikut:

```jsx
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
```

Kemudian, method yang dijalankan oleh `onPress` pada tombol "Clear Data" diganti dengan `createClearDataAlert` dengan cara:

```jsx
/*Kode Lain*/
<Button
  style={{ marginTop: 15 }}
  title="Clear Data"
  onPress={createClearDataAlert}
></Button>
/*Kode Lain*/
```

## 4 Source Code

Source code lengkap yang tertulis di bawah ini merupakan source code setelah adanya bug fix dan improvisasi UI.

### 4.1 App.jsx

![](./assets/laporan/components/app.png)

File `App.jsx` merupakan entry point dari project React, atau lebih tepatnya merupakan `root` component. Di file ini, didefinisikaan sebuah `BottomNavigator` dan dirender di satu `Stack.Screen`. Karena itu, pergantian halaman akan terjadi ketika tombol pada `BottomNavigator ditekan`.

File `App.jsx`:

```jsx
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { AboutScreen, TaskCompletedScreen, TaskScreen } from './screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Task') {
            iconName = 'tasks';
          } else if (route.name === 'Completed') {
            iconName = 'clipboard-check';
          } else if (route.name === 'About') {
            iconName = 'exclamation-circle';
          }
          return (
            <FontAwesome5
              name={iconName}
              size={size}
              color={focused ? 'navy' : color}
            />
          );
        },
        tabBarIconStyle: { marginTop: 10 },
        tabBarLabel: ({ children, color, focused }) => {
          return (
            <Text style={{ marginBottom: 10, color: focused ? 'navy' : color }}>
              {children}
            </Text>
          );
        },
        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen
        name="Task"
        component={TaskScreen}
        options={{ title: 'All Task', unmountOnBlur: true }}
      />
      <Tab.Screen
        name="Completed"
        component={TaskCompletedScreen}
        options={{ unmountOnBlur: true }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{ unmountOnBlur: true }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="BottomNavigator"
          component={BottomNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
```

### 4.2 screens/index.js

![](./assets/laporan/components/index.png)

File `screens/index.js` bukan sebuah komponen, tetapi sebuah file Javascript biasa untuk melakukan outsourcing module sehingga komponen yang berada di direktori yang sama dengannya akan dapat di-import dengan mudah.

File `screens/index.jsx`:

```js
import AboutScreen from './About';
import TaskScreen from './TaskAll';
import TaskCompletedScreen from './TaskCompleted';

export { AboutScreen, TaskCompletedScreen, TaskScreen };
```

### 4.3 screens/About.jsx

![](./assets/laporan/components/1.%20about.png)

Komponen ini merupakan komponen layar untuk menampilkan deskripsi tentang aplikasi ini. Terdapat sebuah tombol "Clear Data" yang apabila ditekan maka akan menghapus semua data task pada local storage.

File `screens/About.jsx`:

```jsx
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
```

### 4.4 TaskAll.jsx

![](./assets/laporan/components/2.%20task%20all.png)

Komponen `screens/TaskAll.jsx` merpakan komponen lyara untuk menampilkan beberapa komponen berikut:

1. `TextInput` untuk mengisikan nama task.
2. `TouchableOpacity` untuk menambahkan task.
3. `FlatList` untuk menampilkan daftar task yang telah dibuat.

Di dalam `FlatList`, terdapat task yang bisa diedit, dihapus, dan diubah statusnya menjadi `isCompleted` sehingga akan ditampilkan di halaman `TaskCompleted`.

File `screens/TaskAll.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskScreen = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  const getStorageData = async () => {
    const value = await AsyncStorage.getItem('@task-list');
    if (value !== null) {
      const allData = JSON.parse(value);
      return allData;
    } else {
      return [];
    }
  };

  const handleAddTask = async () => {
    if (task === '') {
      Alert.alert('Fill Task Please!');
      return;
    }

    // check if any task exist
    const allList = await getStorageData();
    const foundDuplicateTask = allList.some((el) => el.title === task);
    if (foundDuplicateTask) {
      Alert.alert('Task Already Exist!');
      return;
    }

    try {
      if (editIndex !== -1) {
        // Edit existing task
        const updatedTasks = [...tasks];
        updatedTasks[editIndex].title = task;
        AsyncStorage.setItem('@task-list', JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
        setEditIndex(-1);
      } else {
        // Add new task
        const tempList = [...tasks, { title: task, isCompleted: false }];
        AsyncStorage.setItem('@task-list', JSON.stringify(tempList));
        setTasks(tempList);
      }
      setTask('');
    } catch (e) {
      console.log('Error add task: in task-all.js');
      console.error(e.message);
    }
  };

  const getTaskList = async () => {
    try {
      const allData = await getStorageData();
      console.log(allData);
      if (allData.length !== 0) {
        const uncompletedData = allData.filter((item) => !item.isCompleted);
        setTasks(uncompletedData);
      } else {
        console.log('No Tasks');
      }
    } catch (e) {
      console.log('Error get task: in task-all.js');
      console.error(e);
    }
  };

  const handleDeleteTask = async (item, index) => {
    const allList = await getStorageData();
    const deletedList = allList.filter(
      (list, listIndex) => list.title !== item.title
    );
    try {
      AsyncStorage.setItem('@task-list', JSON.stringify(deletedList));
      setTasks(deletedList);
    } catch (e) {
      console.log('Error delete task: in task-all.js');
      console.error(e.message);
    }
  };

  const handleStatusChange = async (item, index) => {
    const allList = await getStorageData();
    var tempIndex = allList.findIndex((el) => el.title == item.title);
    allList[tempIndex].isCompleted = !allList[tempIndex].isCompleted;
    try {
      AsyncStorage.setItem('@task-list', JSON.stringify(allList));
      getTaskList();
    } catch (e) {
      console.log('Error update status task: in task-all.js');
      console.error(e.message);
    }
  };

  useEffect(() => {
    getTaskList();
  }, []);

  const handleEditTask = (index) => {
    const taskToEdit = tasks[index];
    setTask(taskToEdit.title);
    setEditIndex(index);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.task}>
      <Text style={styles.itemList}>{item.title}</Text>
      <View style={styles.taskButtons}>
        <TouchableOpacity onPress={() => handleEditTask(index)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTask(item, index)}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleStatusChange(item, index)}>
          <Text style={styles.statusButton}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemBorder}></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={task}
        onChangeText={(text) => setTask(text)}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.addButtonText}>
          {editIndex !== -1 ? 'Update Task' : 'Add Task'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
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
    color: '#ED1B24',
  },
  input: {
    borderWidth: 3,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  task: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    fontSize: 18,
  },
  itemList: {
    fontSize: 19,
  },
  itemBorder: {
    borderWidth: 0.5,
    borderColor: '#cccccc',
  },
  taskButtons: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusButton: {
    marginLeft: 10,
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default TaskScreen;
```

### 4.5 TaskCompleted.jsx

![](./assets/laporan/components/3.%20task%20completed.png)

Komponen `screens/TaskCompleted.jsx` merupakan komponen halaman untuk menampilkan daftar task yang sudah diberi tanda `isCompleted` dari halaman `TaskAll`. Di setiap  task, terdapat tombol "Delete" dan "Undone". Tombol "Delete" akan menghapus task dari local storage, sedangkan tombol "Undone" akan mengembalikan status task menjadid `isCompleted === false`, dan ditampilkan kembali di halaman `TaskAll`.

Terdapat bug di halaman ini yang sudah diperbaiki pada [Bab 2](#2-bug-dan-bug-fixing).

File `screens/TaskCompleted.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskCompletedScreen = () => {
  const [tasks, setTasks] = useState([]);

  const getStorageData = async () => {
    const value = await AsyncStorage.getItem('@task-list');
    if (value !== null) {
      const allData = JSON.parse(value);
      return allData;
    } else {
      return [];
    }
  };

  const handleDeleteTask = async (item, index) => {
    const allList = await getStorageData();
    const deletedList = allList.filter(
      (list, listIndex) => list.title !== item.title
    );
    try {
      AsyncStorage.setItem('@task-list', JSON.stringify(deletedList));
      setTasks(
        deletedList.filter((list, listIndex) => list.isCompleted === true)
      );
    } catch (e) {
      console.log('Error delete task: in task-all.js');
      console.error(e.message);
    }
  };

  const handleStatusChange = async (item, index) => {
    const allList = await getStorageData();
    var tempIndex = allList.findIndex((el) => el.title == item.title);
    allList[tempIndex].isCompleted = !allList[tempIndex].isCompleted;
    try {
      AsyncStorage.setItem('@task-list', JSON.stringify(allList));
      getTaskList();
    } catch (e) {
      console.log('Error update status task: in task-completed.js');
      console.error(e.message);
    }
  };

  const getTaskList = async () => {
    try {
      const allData = await getStorageData();
      console.log(allData);
      if (allData !== 0) {
        const completedData = allData.filter((item) => item.isCompleted);
        setTasks(completedData);
      } else {
        console.log('No tasks');
      }
    } catch (e) {
      console.log('Error get task: in task-completed.js');
      console.error(e);
    }
  };

  useEffect(() => {
    getTaskList();
  }, []);

  const renderItem = ({ item, index }) => (
    <View style={styles.task}>
      <Text style={styles.itemList}>{item.title}</Text>
      <View style={styles.taskButtons}>
        <TouchableOpacity onPress={() => handleDeleteTask(item, index)}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleStatusChange(item, index)}>
          <Text style={styles.statusButton}>Undone</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemBorder}></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Completed Task</Text>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
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
    color: 'green',
  },
  input: {
    borderWidth: 3,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  task: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    fontSize: 18,
  },
  itemList: {
    fontSize: 19,
  },
  itemBorder: {
    borderWidth: 0.5,
    borderColor: '#cccccc',
  },
  taskButtons: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusButton: {
    marginLeft: 10,
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default TaskCompletedScreen;

```

## 5 Penutup

Dengan demikian, pengerjaan modul ini dapat membawa pemahaman terkait dengan penggunaan local storage pada framework React Native. Selain itu, modul ini juga memberikan pengalaman dalam melakukan bug fixing dan improvisasi UI agar aplikasi dapat menjadi lebih baik lagi. Demikian laporan ini dibuat, terimakasih.
