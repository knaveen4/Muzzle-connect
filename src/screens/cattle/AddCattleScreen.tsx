import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

type AddCattleRouteProp = RouteProp<RootStackParamList, 'AddCattle'>;

interface FormData {
  beneficiary_id: string;
  breed: string;
  age: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  front_image: string;
  left_image: string;
  right_image: string;
  muzzle_images: string[];
}

interface ApiResponse {
  status: string;
  cattle_id?: string;
  location?: {
    state: string;
    district: string;
    mandal: string;
    village: string;
  };
  image_urls: string[];
}

const telanganaDistricts = [
  { id: 'AD', name: 'Adilabad' },
  { id: 'BH', name: 'Bhadradri Kothagudem' },
  { id: 'HY', name: 'Hyderabad' },
  { id: 'JA', name: 'Jagtial' },
  { id: 'JI', name: 'Jangaon' },
  { id: 'JW', name: 'Jayashankar Bhupalpally' },
  { id: 'JU', name: 'Jogulamba Gadwal' },
  { id: 'KA', name: 'Kamareddy' },
  { id: 'KH', name: 'Karimnagar' },
  { id: 'KM', name: 'Khammam' },
  { id: 'KO', name: 'Komaram Bheem Asifabad' },
  { id: 'MA', name: 'Mahabubabad' },
  { id: 'MB', name: 'Mahabubnagar' },
  { id: 'ME', name: 'Mancherial' },
  { id: 'MD', name: 'Medak' },
  { id: 'MU', name: 'Medchal-Malkajgiri' },
  { id: 'NA', name: 'Nagarkurnool' },
  { id: 'NI', name: 'Nalgonda' },
  { id: 'NN', name: 'Nirmal' },
  { id: 'NZ', name: 'Nizamabad' },
  { id: 'PE', name: 'Peddapalli' },
  { id: 'RA', name: 'Rajanna Sircilla' },
  { id: 'RN', name: 'Rangareddy' },
  { id: 'SA', name: 'Sangareddy' },
  { id: 'SI', name: 'Siddipet' },
  { id: 'SU', name: 'Suryapet' },
  { id: 'VI', name: 'Vikarabad' },
  { id: 'WA', name: 'Wanaparthy' },
  { id: 'WL', name: 'Warangal Rural' },
  { id: 'WU', name: 'Warangal Urban' },
  { id: 'YA', name: 'Yadadri Bhuvanagiri' }
];

const khammamMandalVillageData = {
  mandals: [
    { id: 'KM01', name: 'Khammam Urban' },
    { id: 'KM02', name: 'Khammam Rural' },
    { id: 'KM03', name: 'Mudigonda' },
    { id: 'KM04', name: 'Nelakondapalli' },
    { id: 'KM05', name: 'Chintakani' },
    { id: 'KM06', name: 'Konijerla' },
    { id: 'KM07', name: 'Tallada' },
    { id: 'KM08', name: 'Kusumanchi' },
    { id: 'KM09', name: 'Aswaraopeta' },
    { id: 'KM10', name: 'Dammapeta' },
    { id: 'KM11', name: 'Sathupalli' },
    { id: 'KM12', name: 'Penuballi' },
    { id: 'KM13', name: 'Kalluru' },
    { id: 'KM14', name: 'Vemsoor' },
    { id: 'KM15', name: 'Bonakal' },
    { id: 'KM16', name: 'Madhira' },
    { id: 'KM17', name: 'Yerrupalem' },
    { id: 'KM18', name: 'Wyra' },
    { id: 'KM19', name: 'Julurpadu' },
    { id: 'KM20', name: 'Bayyaram' },
    { id: 'KM21', name: 'Garla' },
    { id: 'KM22', name: 'Singareni' },
    { id: 'KM23', name: 'Kamepalli' },
    { id: 'KM24', name: 'Chandrugonda' },
    { id: 'KM25', name: 'Mulakalapalli' },
    { id: 'KM26', name: 'Thirumalayapalem' },
    { id: 'KM27', name: 'Palair' },
    { id: 'KM28', name: 'Enkoor' }
  ],
  villages: {
    'KM01': [
      { id: 'KM0101', name: 'Khammam (Urban)' },
      { id: 'KM0102', name: 'Kothagudem' },
      { id: 'KM0103', name: 'Bommakal' }
    ],
    // ... other villages data
  }
};

const AddCattleScreen = () => {
  const route = useRoute<AddCattleRouteProp>();
  const navigation = useNavigation();
  const { beneficiary_id } = route.params;

  const [formData, setFormData] = useState<FormData>({
    beneficiary_id,
    breed: '',
    age: '',
    state: 'TS',
    district: '',
    mandal: '',
    village: '',
    front_image: '',
    left_image: '',
    right_image: '',
    muzzle_images: [],
  });

  const [step, setStep] = useState<number>(1);
  const [muzzleVerified, setMuzzleVerified] = useState<boolean>(false);
  const [frontImageCaptured, setFrontImageCaptured] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [capturingBurst, setCapturingBurst] = useState(false);
  const [burstProgress, setBurstProgress] = useState(0);
  const [filteredMandal, setFilteredMandal] = useState<{id: string, name: string}[]>([]);
  const [filteredVillage, setFilteredVillage] = useState<{id: string, name: string}[]>([]);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'App needs access to your camera',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
          setPermissionDenied(granted === PermissionsAndroid.RESULTS.DENIED);
        } catch (err) {
          console.warn(err);
          setHasCameraPermission(false);
        }
      } else {
        setHasCameraPermission(true);
      }
    };
    checkCameraPermission();
  }, []);

  // Filter mandals based on selected district
  useEffect(() => {
    if (formData.district === 'KM') {
      setFilteredMandal(khammamMandalVillageData.mandals);
      setFormData(prev => ({ ...prev, mandal: '', village: '' }));
    } else {
      setFilteredMandal([]);
      setFilteredVillage([]);
      setFormData(prev => ({ ...prev, mandal: '', village: '' }));
    }
  }, [formData.district]);

  // Filter villages based on selected mandal
  useEffect(() => {
    if (formData.mandal && formData.district === 'KM') {
      const villages = khammamMandalVillageData.villages[formData.mandal as keyof typeof khammamMandalVillageData.villages] || [];
      setFilteredVillage(villages);
      setFormData(prev => ({ ...prev, village: '' }));
    } else {
      setFilteredVillage([]);
      setFormData(prev => ({ ...prev, village: '' }));
    }
  }, [formData.mandal]);

  const handleInputChange = (key: keyof FormData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const captureMuzzleBurst = async () => {
  if (Platform.OS === 'android' && hasCameraPermission === false) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      setPermissionDenied(true);
      return;
    }
    setHasCameraPermission(true);
  }

  setCapturingBurst(true);
  const newMuzzleImages: string[] = [];
  
  try {
    // Capture 4 muzzle images with cropping enabled
    for (let i = 0; i < 4; i++) {
      setBurstProgress(i + 1);
      
      const image = await ImagePicker.openCamera({
        width: 800,
        height: 800,
        cropping: true,  // Enable cropping
        cropperCircleOverlay: false, // Square crop
        freeStyleCropEnabled: true, // Allow flexible crop
        mediaType: 'photo',
        includeBase64: true,
        compressImageQuality: 0.8,
      });

      if (image) {
        newMuzzleImages.push(image.path);
      }
      
      // Add delay between shots except for the last one
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setFormData(prev => ({
      ...prev,
      muzzle_images: newMuzzleImages,
    }));
  } catch (error) {
    if (error.code !== 'E_PICKER_CANCELLED') {
      Alert.alert('Error', 'Could not capture images');
      console.error(error);
    }
  } finally {
    setCapturingBurst(false);
    setBurstProgress(0);
  }
};

  const verifyFirstMuzzleImage = async () => {
    if (formData.muzzle_images.length === 0) {
      Alert.alert('Missing', 'No muzzle images to verify');
      return;
    }

    setVerifying(true);
    try {
      const form = new FormData();
      
      // Only send the first muzzle image for verification
      form.append('files', {
        uri: formData.muzzle_images[0],
        name: 'muzzle_0.jpg',
        type: 'image/jpeg',
      } as any);

      form.append('state', formData.state);
      form.append('district', formData.district);
      form.append('mandal', formData.mandal);
      form.append('village', formData.village);

      const res = await fetch('http://107.210.222.39:8001/search/', {
        method: 'POST',
        body: form,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server responded with status ${res.status}: ${text}`);
      }

      const result = await res.json();

      if (result.length && result[0].score < 0.77) {
        Alert.alert(
          'Image Not Clear',
          'Please retake clearer muzzle images',
          [
            {
              text: 'Retake',
              onPress: captureMuzzleBurst
            },
            { 
              text: 'Continue Anyway',
              onPress: () => setMuzzleVerified(true)
            }
          ]
        );
        return;
      }

      if (!result.length || result?.status !== 'success') {
        // No match found, proceed with registration
        setMuzzleVerified(true);
      } else {
        // Match found, show options
        Alert.alert(
          'Match Found',
          `Existing Cattle ID: ${result[0].cattle_id}\n\nWould you like to use this or register as new?`,
          [
            {
              text: 'Register New',
              onPress: () => setMuzzleVerified(true),
              style: 'destructive'
            },
            {
              text: 'View Existing',
              onPress: () => {
                navigation.navigate('CattleDetails', { cattleId: result[0].cattle_id });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Verification Error:', error);
      Alert.alert(
        'Error',
        'Could not verify muzzle image',
        [
          {
            text: 'Try Again',
            onPress: verifyFirstMuzzleImage
          },
          {
            text: 'Continue Anyway',
            onPress: () => setMuzzleVerified(true),
            style: 'destructive'
          }
        ]
      );
    } finally {
      setVerifying(false);
    }
  };

  const captureFrontImage = async () => {
    if (Platform.OS === 'android' && hasCameraPermission === false) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionDenied(true);
        return;
      }
      setHasCameraPermission(true);
    }

    try {
      const image = await ImagePicker.openCamera({
        width: 800,
        height: 800,
        cropping: false,
        mediaType: 'photo',
        includeBase64: true,
        compressImageQuality: 0.8,
      });

      if (image) {
        setFormData(prev => ({
          ...prev,
          front_image: image.path,
        }));
        setFrontImageCaptured(true);
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Could not capture image');
        console.error(error);
      }
    }
  };

  const handleImagePick = async (field: keyof FormData) => {
    if (Platform.OS === 'android' && hasCameraPermission === false) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionDenied(true);
        return;
      }
      setHasCameraPermission(true);
    }

    try {
      const options = {
        width: 800,
        height: 800,
        cropping: false,
        mediaType: 'photo' as const,
        includeBase64: true,
        compressImageQuality: 0.8,
      };

      const image = await ImagePicker.openCamera(options);

      if (image) {
        setFormData(prev => ({ ...prev, [field]: image.path }));
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Could not take picture');
        console.error(error);
      }
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [
      { field: 'beneficiary_id', name: 'Beneficiary ID' },
      { field: 'breed', name: 'Breed' },
      { field: 'age', name: 'Age' },
      { field: 'state', name: 'State' },
      { field: 'district', name: 'District' },
      { field: 'mandal', name: 'Mandal' },
      { field: 'village', name: 'Village' },
      { field: 'front_image', name: 'Front Image' },
      { field: 'left_image', name: 'Left Side Image' },
      { field: 'right_image', name: 'Right Side Image' },
    ];

    const missingFields = requiredFields.filter(
      ({ field }) => !formData[field as keyof FormData]
    );

    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Fields',
        `Please fill all required fields: ${missingFields.map(f => f.name).join(', ')}`
      );
      return;
    }

    if (formData.muzzle_images.length === 0) {
      Alert.alert('Missing', 'Please capture muzzle images');
      return;
    }

    if (!/^[1-9]\d*$/.test(formData.age)) {
      Alert.alert('Invalid Input', 'Age must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('beneficiary_id', formData.beneficiary_id);
      form.append('breed', formData.breed);
      form.append('age', formData.age);
      form.append('state', formData.state);
      form.append('district', formData.district);
      form.append('mandal', formData.mandal);
      form.append('village', formData.village);

      const appendImage = (field: string, uri: string, name: string) => {
        if (uri) {
          form.append(field, {
            uri,
            name: `${name}.jpg`,
            type: 'image/jpeg',
          } as any);
        }
      };

      appendImage('front_image', formData.front_image, 'front');
      appendImage('left_image', formData.left_image, 'left');
      appendImage('right_image', formData.right_image, 'right');

      formData.muzzle_images.forEach((img, index) => {
        form.append('muzzle_images', {
          uri: img,
          name: `muzzle_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('http://107.210.222.39:8000/registerCattle/', {
        method: 'POST',
        body: form,
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${text}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Registration failed');
      }

      const locationStr = data.location
        ? `${data.location.state}, ${data.location.district}, ${data.location.mandal}, ${data.location.village}`
        : 'Unknown location';

      Alert.alert(
        'Success',
        `Cattle registered successfully with ID: ${data.cattle_id || 'N/A'}\nLocation: ${locationStr}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Submission Error:', error);
      let errorMessage = 'Failed to register cattle';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out - please try again';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error - please check your internet connection';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderImageBox = (label: string, field: keyof FormData, caption: string) => (
    <View style={styles.imageColumn}>
      <TouchableOpacity
        style={[
          styles.imageBox,
          formData[field] && styles.uploadedImageBox,
          permissionDenied && styles.disabledImageBox,
        ]}
        onPress={() => handleImagePick(field)}
        disabled={permissionDenied || capturingBurst}
      >
        {permissionDenied ? (
          <View style={styles.permissionDeniedView}>
            <Ionicons name="warning" size={24} color="red" />
            <Text style={styles.permissionDeniedText}>Camera access denied</Text>
          </View>
        ) : formData[field] ? (
          <Image source={{ uri: formData[field] }} style={styles.uploadedImage} />
        ) : (
          <>
            <Ionicons
              name="camera"
              size={30}
              color={hasCameraPermission ? '#6e45e2' : 'gray'}
            />
            <Text style={styles.imageText}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.caption}>{caption}</Text>
      {formData[field] && (
        <TouchableOpacity
          onPress={() => handleImagePick(field)}
          disabled={verifying || capturingBurst}
        >
          <Text style={styles.retakeText}>
            {verifying ? 'Verifying...' : 'Retake'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMuzzleStep = () => (
    <>
      <Text style={styles.sectionTitle}>Muzzle Verification</Text>
      
      {capturingBurst ? (
        <View style={styles.burstContainer}>
          <ActivityIndicator size="large" color="#6e45e2" />
          <Text style={styles.burstText}>Capturing muzzle images ({burstProgress}/4)</Text>
          <Text style={styles.burstHint}>Please keep the muzzle steady</Text>
        </View>
      ) : (
        <>
          {formData.muzzle_images.length > 0 ? (
            <View style={styles.muzzlePreviewContainer}>
              <Text style={styles.muzzlePreviewTitle}>Muzzle Images Captured:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {formData.muzzle_images.map((img, index) => (
                  <View key={index} style={styles.muzzlePreviewWrapper}>
                    <Image 
                      source={{ uri: img }} 
                      style={styles.muzzlePreviewImage} 
                    />
                    <Text style={styles.muzzleImageIndex}>{index + 1}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.instructionText}>
              Please capture 4 images of the cattle's muzzle for verification
            </Text>
          )}

          {formData.muzzle_images.length === 0 ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={captureMuzzleBurst}
              disabled={permissionDenied}
            >
              <Text style={styles.buttonText}>Capture Muzzle Images (4)</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={verifyFirstMuzzleImage}
              disabled={verifying || permissionDenied}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Muzzle</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );

  const renderFrontImageStep = () => (
    <>
      <Text style={styles.sectionTitle}>Front Image</Text>
      <Text style={styles.instructionText}>
        Please capture a full body view of the cattle
      </Text>
      
      {formData.front_image ? (
        <View style={styles.imageColumn}>
          <Image source={{ uri: formData.front_image }} style={styles.largeImage} />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setFrontImageCaptured(true)}
          >
            <Text style={styles.buttonText}>Continue to Side Views</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={captureFrontImage}
          disabled={permissionDenied}
        >
          <Text style={styles.buttonText}>Capture Front Image</Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderSideImagesStep = () => (
    <>
      <Text style={styles.sectionTitle}>Side Views</Text>
      
      <View style={styles.imageRow}>
        {renderImageBox('Right Side', 'right_image', 'Required')}
        {renderImageBox('Left Side', 'left_image', 'Required')}
      </View>
      
      {formData.right_image && formData.left_image && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep(2)}
        >
          <Text style={styles.buttonText}>Continue to Details</Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderFormStep = () => (
    <>
      <Text style={styles.sectionTitle}>Cattle Details</Text>

      <Text style={styles.label}>State *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.state}
          onValueChange={(value) => handleInputChange('state', value)}
          style={styles.picker}
          enabled={false}
        >
          <Picker.Item label="Telangana" value="TS" />
        </Picker>
      </View>

      <Text style={styles.label}>District *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.district}
          onValueChange={(value) => handleInputChange('district', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select District" value="" />
          {telanganaDistricts.map((district) => (
            <Picker.Item key={district.id} label={district.name} value={district.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Mandal *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.mandal}
          onValueChange={(value) => handleInputChange('mandal', value)}
          style={styles.picker}
          enabled={!!formData.district}
        >
          <Picker.Item label={formData.district ? "Select Mandal" : "First select District"} value="" />
          {filteredMandal.map((mandal) => (
            <Picker.Item key={mandal.id} label={mandal.name} value={mandal.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Village *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.village}
          onValueChange={(value) => handleInputChange('village', value)}
          style={styles.picker}
          enabled={!!formData.mandal}
        >
          <Picker.Item label={formData.mandal ? "Select Village" : "First select Mandal"} value="" />
          {filteredVillage.map((village) => (
            <Picker.Item key={village.id} label={village.name} value={village.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Breed *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter breed"
        value={formData.breed}
        onChangeText={(val) => handleInputChange('breed', val)}
      />

      <Text style={styles.label}>Age (months) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter age in months"
        keyboardType="numeric"
        value={formData.age}
        onChangeText={(val) => handleInputChange('age', val)}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep(1)}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register Cattle</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderCurrentStep = () => {
    if (!muzzleVerified) {
      return renderMuzzleStep();
    } else if (!frontImageCaptured) {
      return renderFrontImageStep();
    } else if (step === 1) {
      return renderSideImagesStep();
    } else {
      return renderFormStep();
    }
  };

  if (hasCameraPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6e45e2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Cattle</Text>
      </View>
      {permissionDenied && (
        <View style={styles.permissionBanner}>
          <Ionicons name="warning" size={20} color="white" />
          <Text style={styles.permissionBannerText}>
            Camera permission is required. Please enable it in device settings.
          </Text>
        </View>
      )}
      {renderCurrentStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6e45e2',
    marginBottom: 16,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  imageBox: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: '#6e45e2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  disabledImageBox: {
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  largeImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6e45e2',
    marginBottom: 16,
  },
  imageText: {
    fontSize: 12,
    color: '#6e45e2',
    marginTop: 8,
    textAlign: 'center',
  },
  caption: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  retakeText: {
    fontSize: 12,
    color: '#6e45e2',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    backgroundColor: '#6e45e2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  secondaryButton: {
    backgroundColor: '#ccc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 12,
  },
  pickerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  permissionBanner: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionBannerText: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  permissionDeniedView: {
    alignItems: 'center',
    padding: 8,
  },
  permissionDeniedText: {
    color: 'red',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  burstContainer: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  burstText: {
    marginTop: 10,
    color: '#333',
    fontWeight: '500',
  },
  burstHint: {
    marginTop: 5,
    color: '#666',
    fontSize: 12,
  },
  muzzlePreviewContainer: {
    marginVertical: 16,
  },
  muzzlePreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  muzzlePreviewWrapper: {
    alignItems: 'center',
    marginRight: 10,
  },
  muzzlePreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  muzzleImageIndex: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default AddCattleScreen;