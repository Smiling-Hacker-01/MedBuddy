import { View, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useState } from 'react';
import { doctors } from '../data/doctors';

export default function PrescriptionViewer() {
  const router = useRouter();
  const { doctorId, prescriptionId } = useLocalSearchParams();
  const [scale, setScale] = useState(1);

  const doctor = doctors.find(d => d.id === doctorId);
  const prescription = doctor?.prescriptions?.find(p => p.id === prescriptionId);

  if (!prescription) {
    router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.closeButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </Pressable>
      
      <Image
        source={{ uri: prescription.imageUri }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
}); 