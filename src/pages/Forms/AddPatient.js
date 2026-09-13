import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../Theme/ThemeContext';
import { Dropdown } from 'react-native-element-dropdown';
import { SUPABASE_REST_URL, SUPABASE_HEADERS } from '../../config/api';

export default function AddPatient({ navigation }) {
  const { colors } = useAppTheme();

  const [bloodGroup, setBloodGroup] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [bodyMass, setBodyMass] = useState('');
  const [rhFactor, setRhFactor] = useState('');
  const [cmvStatus, setCmvStatus] = useState('');
  
    const [hlaA_2, setHlaA_2] = useState('');
    const [hlaA_1, setHlaA_1] = useState('');
    const [hlaB_1, setHlaB_1] = useState('');
    const [hlaB_2, setHlaB_2] = useState('');
    const [hlaC_1, setHlaC_1] = useState('');
    const [hlaC_2, setHlaC_2] = useState('');
    const [hlaDRB1_1, setHlaDRB1_1] = useState('');
    const [hlaDRB1_2, setHlaDRB1_2] = useState('');
    const [hlaDQB1_1, setHlaDQB1_1] = useState('');
    const [hlaDQB1_2, setHlaDQB1_2] = useState('');
  
    const hlaAOptions = [
    { label: '01:01', value: '01:01' },
    { label: '02:02', value: '02:01' },
    { label: '03:01', value: '03:01' },
    { label: '24:02', value: '24:02' },
    { label: '11:01', value: '11:01' },
    { label: '29:02', value: '29:02' },
    { label: '31:01', value: '31:01' },
    { label: '32:01', value: '32:01' },
    { label: '68:01', value: '68:01' },
    { label: '23:01', value: '23:01' },
  ];
  
  const hlaBOptions = [
    { label: '07:02', value: '07:02' },
    { label: '08:01', value: '08:01' },
    { label: '15:01', value: '15:01' },
    { label: '44:02', value: '44:02' },
    { label: '35:01', value: '35:01' },
    { label: '51:01', value: '51:01' },
    { label: '40:01', value: '40:01' },
    { label: '18:01', value: '18:01' },
    { label: '57:01', value: '57:01' },
    { label: '44:03', value: '44:03' },
  ];
  
  const hlaCOptions = [
    { label: '07:01', value: '07:01' },
    { label: '07:02', value: '07:02' },
    { label: '04:01', value: '04:01' },
    { label: '03:04', value: '03:04' },
    { label: '06:02', value: '06:02' },
    { label: '05:01', value: '05:01' },
    { label: '12:03', value: '12:03' },
    { label: '02:02', value: '02:02' },
    { label: '08:02', value: '08:02' },
    { label: '03:03', value: '03:03' },
  ];
  
  const hlaDRB1Options = [
    { label: '15:01', value: '15:01' },
    { label: '07:01', value: '07:01' },
    { label: '03:01', value: '03:01' },
    { label: '13:01', value: '13:01' },
    { label: '04:01', value: '04:01' },
    { label: '01:01', value: '01:01' },
    { label: '11:01', value: '11:01' },
    { label: '04:04', value: '04:04' },
    { label: '08:01', value: '08:01' },
    { label: '12:01', value: '12:01' },
  ];
  
  const hlaDQB1Options = [
    { label: '06:02', value: '06:02' },
    { label: '02:01', value: '02:01' },
    { label: '03:01', value: '03:01' },
    { label: '05:01', value: '05:01' },
    { label: '03:02', value: '03:02' },
    { label: '06:03', value: '06:03' },
    { label: '04:02', value: '04:02' },
    { label: '02:02', value: '02:02' },
    { label: '05:02', value: '05:02' },
    { label: '06:01', value: '06:01' },
  ];
  

 const handleSubmit = async () => {
    if (!name || !bloodGroup || !age || !gender || !bodyMass || !rhFactor || !cmvStatus) {
    Alert.alert("Missing Fields", "Please fill all mandatory fields");
    return;
  }
  try {
    const response = await fetch(
      `${SUPABASE_REST_URL}/Patient`,
      {
        method: 'POST',
        headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({
          Name: name,
          Age: age ? parseInt(age) : null,
          Gender: gender,
          BloodGroup: bloodGroup,
          Contact: contact,
          BodyMass: bodyMass,
          RhFactor: rhFactor,
          CMVStatus: cmvStatus,
          Hla_a_1: hlaA_1,
          Hla_a_2: hlaA_2,
          Hla_b_2: hlaB_2,
          Hla_b_1: hlaB_1,
          Hla_c_1: hlaC_1,
          Hla_c_2: hlaC_2,
          Hla_drb1_1: hlaDRB1_1,
          Hla_drb1_2: hlaDRB1_2,
          Hla_dqb1_1: hlaDQB1_1,
          Hla_dqb1_2: hlaDQB1_2,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(errorText);
      alert('Insert failed');
      return;
    }

     Alert.alert('Success', 'Patient added successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('MainTabs'),
      },
    ]);
  } catch (error) {
    console.log(error);
    alert('Something went wrong');
  }
};

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Add Patient
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter patient details below
          </Text>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >

          <TextInput
            placeholder="Name  *"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Blood Group  *"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            onChangeText={setBloodGroup}
          />

          <TextInput
            placeholder="Age  *"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            onChangeText={setAge}
          />

          <TextInput
            placeholder="Gender  *"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            onChangeText={setGender}
          />

          <TextInput
            placeholder="Body Mass (kg)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            onChangeText={setBodyMass}
          />

          <TextInput
            placeholder="Rh Factor (plus/minus)  *"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            onChangeText={setRhFactor}
          />

          <TextInput
            placeholder="CMV Status (present/absent)  *"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            onChangeText={setCmvStatus}
          />

          <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaAOptions}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_A allele 1"
              value={hlaA_1}
              onChange={item => setHlaA_1(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

             <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaAOptions}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_A allele 2"
              value={hlaA_2}
              onChange={item => setHlaA_2(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border}]}
              data={hlaBOptions}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_B allele 1"
              value={hlaB_1}
              onChange={item => setHlaB_1(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border}]}
              data={hlaBOptions}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_B allele 2"
              value={hlaB_2}
              onChange={item => setHlaB_2(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaCOptions}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_C allele 1"
              value={hlaC_1}
              onChange={item => setHlaC_1(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaCOptions}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_C allele 2"
              value={hlaC_2}
              onChange={item => setHlaC_2(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaDRB1Options}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_DRB1 allele 1"
              value={hlaDRB1_1}
              onChange={item => setHlaDRB1_1(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaDRB1Options}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_DRB1 allele 2"
              value={hlaDRB1_2}
              onChange={item => setHlaDRB1_2(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaDQB1Options}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_DQB1 allele 1"
              value={hlaDQB1_1}
              onChange={item => setHlaDQB1_1(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

            <Dropdown
              style={[styles.input, { borderColor: colors.border }]}
              data={hlaDQB1Options}
              labelField="label"
              valueField="value"
              placeholder="Select HLA_DQB1 allele 2"
              value={hlaDQB1_2}
              onChange={item => setHlaDQB1_2(item.value)}
              placeholderStyle={{ color: colors.textSecondary }}
              selectedTextStyle={{ color: colors.text }}
            />

          <TextInput
            placeholder="Contact"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            onChangeText={setContact}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});