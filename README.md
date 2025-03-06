# MedBuddy

MedBuddy is a **React Native (Expo)** mobile application designed to securely store and manage personal medical information offline. It helps users track their medical history, prescriptions, doctor consultations, and health metrics efficiently.

## 📌 Features

- **User Profile Management** (Name, Phone, Email, Date of Birth, etc.)
- **Doctor Consultation History**
- **Prescription & Medicine Tracking along with alarm feature reminders (OCR for handwritten prescriptions)**
- **Medical Conditions & Disease Logging**
- **Allergy Records & Immunization Tracking**
- **Health Metrics Storage** (Blood Pressure, Pulse, etc.)
- **Offline Data Storage with Cloud Sync (Firestore)**
- **Login/Sign-up with OTP Authentication**

## 🚀 Technologies Used

- **Frontend**: React Native (Expo)
- **Backend**: Firebase Firestore (Database)
- **Authentication**: Firebase Authentication (OTP-based login)
- **OCR Feature**: Google ML Kit for Text Recognition

## 🛠️ Installation & Setup

### Prerequisites:

- Node.js & npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- Firebase project set up

### Steps:

1. **Clone the repository**

   ```sh
   git clone https://github.com/Smiling-Hacker-01/MedBuddy.git
   cd MedBuddyFinal
   ```

2. **Install dependencies locally inside your project file**

   ```sh
   npm install
   ```

3. **Set up Firebase (Optional- if you want it to be offline skip this)**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database & Authentication (Phone OTP)
   - Add your `firebaseConfig` inside `firebase.js`

4. **Run the application**

   ```sh
   npx expo start
   ```

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Feel free to submit issues or pull requests to improve MedBuddyFinal!

## 📧 Contact

For queries or collaborations, reach out to **Smiling-Hacker-01** via GitHub or email.

---

**Developed with ❤️ using React Native & Firebase**

