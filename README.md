# Modul 7 - React Native Local Storage

| Nama | Ahmad Mu'min Faisal |
| -- | -- |
| NIM | 1203210101 |
| Kelas | IF-01-01 |

Laporan ini dibuat setelah ditemukannya bug dan dilakukan bug fix serta improvisasi UI. 

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