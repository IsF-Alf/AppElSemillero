import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
    Image,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
interface ErrorMessages {
    email?: string;
    password?: string;
    verificationCode?: string;
    studentName?: string;
    age?: string;
    parentName?: string;
    phoneNumber?: string;
};
interface Payment {
    id: number;
    description: string;
    amount: number;
};

const ElSemilleroApp = () => {
    type ScreenType = 'login' | 'register' | 'verify' | 'dashboard' | 'inscription';
    const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
    type AuthDataType = {
        email: string;
        password: string;
        verificationCode: string;
    };
    const [errors, setErrors] = useState<ErrorMessages>({});

    const [authData, setAuthData] = useState<AuthDataType>({
        email: '',
        password: '',
        verificationCode: '',
    });

    const [formData, setFormData] = useState({
        studentName: '',
        age: '',
        gender: 'masculino',
        parentName: '',
        phoneNumber: '',
    });

    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Próximo Torneo',
            description: 'Este fin de semana tendremos el torneo de primavera',
            date: '2025-02-15'
        },
        {
            id: 2,
            title: 'Cuota Febrero',
            description: 'Ya está disponible el pago de la cuota de febrero',
            date: '2025-02-01'
        }
    ]);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const paymentOptions = [
        { id: 1, description: 'Cuota Mensual', amount: 5000 },
        { id: 2, description: 'Matrícula', amount: 10000 },
        { id: 3, description: 'Equipamiento', amount: 15000 },
    ]; const validateAuth = () => {
        let newErrors: ErrorMessages = {}; // Tipo ErrorMessages

        if (!authData.email) {
            newErrors.email = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(authData.email)) {
            newErrors.email = 'Correo inválido';
        }

        if (!authData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (authData.password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.studentName) newErrors.studentName = 'El nombre es requerido';
        if (!formData.age || isNaN(formData.age)) newErrors.age = 'Ingrese una edad válida';
        if (!formData.parentName) newErrors.parentName = 'El nombre del tutor es requerido';
        if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Ingrese un número válido de 10 dígitos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = () => {
        if (validateAuth()) {
            // Simular envío de código de verificación
            Alert.alert(
                'Código Enviado',
                'Se ha enviado un código de verificación a tu correo',
                [{ text: 'OK', onPress: () => setCurrentScreen('verify') }]
            );
        }
    }; const handleVerification = async () => {
        try {
            // Simular llamada al backend para verificar el código
            const isValid = await verifyCodeWithBackend(authData.verificationCode);

            if (isValid) {
                setCurrentScreen('dashboard');
            } else {
                Alert.alert('Error', 'Código de verificación incorrecto');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo verificar el código. Intente nuevamente.');
        }
    };

    // Simulación de verificación con backend
    const verifyCodeWithBackend = async (code: string) => {
        // Aquí iría la llamada real al backend
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(code === '123456'); // Solo para demo
            }, 1000);
        });
    };

    const handlePayment = (payment) => {
        setSelectedPayment(payment);
        setShowPaymentModal(true);
    }; const processPayment = async () => {
        try {
            if (!selectedPayment) {
                throw new Error('No se ha seleccionado un método de pago');
            }

            // Simular creación de preferencia en Mercado Pago
            const response = await createMercadoPagoPreference(selectedPayment);

            if (response.preferenceId) {
                await Linking.openURL(`mercadopago://app?preference_id=${response.preferenceId}`);
            } else {
                throw new Error('No se pudo obtener el ID de preferencia');
            }
        } catch (error) {
            Alert.alert(
                'Error',
                error.message || 'No se pudo procesar el pago. Intente nuevamente.',
                [{ text: 'OK' }]
            );
        }
    };

    const createMercadoPagoPreference = async (payment: Payment) => {
        // Aquí iría la llamada real al backend para crear la preferencia
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    preferenceId: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    status: 'created'
                });
            }, 1000);
        });
    }; const handleSubmit = async () => {
        if (validateForm()) {
            try {
                // Validar formato del número de teléfono
                const phoneNumber = formData.phoneNumber.replace(/\D/g, '');
                if (phoneNumber.length !== 10) {
                    throw new Error('El número de teléfono debe tener 10 dígitos');
                }

                const adminMessage = encodeURIComponent(`*Nueva Inscripción en El Semillero*\n
*Datos del Alumno:*
Nombre: ${formData.studentName}
Edad: ${formData.age}
Género: ${formData.gender}

*Datos del Tutor:*
Nombre: ${formData.parentName}
Teléfono: ${phoneNumber}`);

                const userMessage = encodeURIComponent(`*¡Gracias por inscribirte en El Semillero!*

Hemos recibido tu inscripción con los siguientes datos:
Nombre del alumno: ${formData.studentName}
Edad: ${formData.age}

Nos pondremos en contacto contigo pronto para los siguientes pasos.`);

                // Enviar mensaje al administrador
                await Linking.openURL(`whatsapp://send?phone=543624200637&text=${adminMessage}`);

                // Esperar un segundo antes de enviar el mensaje al usuario
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Enviar mensaje al usuario
                await Linking.openURL(`whatsapp://send?phone=54${phoneNumber}&text=${userMessage}`);

                // Limpiar el formulario
                setFormData({
                    studentName: '',
                    age: '',
                    gender: 'masculino',
                    parentName: '',
                    phoneNumber: '',
                });

                Alert.alert(
                    '¡Inscripción Exitosa!',
                    'Los mensajes de WhatsApp se abrirán automáticamente',
                    [{ text: 'OK' }]
                );
            } catch (error) {
                Alert.alert(
                    'Error',
                    error.message || 'Asegúrate de tener WhatsApp instalado',
                    [{ text: 'OK' }]
                );
            }
        }
    };

    const renderLoginScreen = () => (
        <View style={styles.form}>
            <Text style={styles.sectionTitle}>Iniciar Sesión</Text>

            <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Correo Electrónico"
                value={authData.email}
                onChangeText={(text) => setAuthData({ ...authData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Contraseña"
                value={authData.password}
                onChangeText={(text) => setAuthData({ ...authData, password: text })}
                secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                <MaterialIcons name="login" size={24} color="white" />
                <Text style={styles.submitButtonText}>Ingresar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setCurrentScreen('inscription')}
            >
                <Text style={styles.secondaryButtonText}>Nueva Inscripción</Text>
            </TouchableOpacity>
        </View>
    );

    const renderVerificationScreen = () => (
        <View style={styles.form}>
            <Text style={styles.sectionTitle}>Verificación</Text>
            <Text style={styles.infoText}>
                Ingresa el código de 6 dígitos enviado a tu correo
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Código de Verificación"
                value={authData.verificationCode}
                onChangeText={(text) => setAuthData({ ...authData, verificationCode: text })}
                keyboardType="number-pad"
                maxLength={6}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleVerification}>
                <MaterialIcons name="verified-user" size={24} color="white" />
                <Text style={styles.submitButtonText}>Verificar</Text>
            </TouchableOpacity>
        </View>
    );

    const renderDashboard = () => (
        <ScrollView style={styles.dashboard}>
            <View style={styles.dashboardHeader}>
                <Text style={styles.welcomeText}>Bienvenido</Text>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => setCurrentScreen('login')}
                >
                    <MaterialIcons name="logout" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Anuncios</Text>
                {announcements.map(announcement => (
                    <View key={announcement.id} style={styles.announcementCard}>
                        <Text style={styles.announcementTitle}>{announcement.title}</Text>
                        <Text style={styles.announcementDescription}>{announcement.description}</Text>
                        <Text style={styles.announcementDate}>{announcement.date}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pagos Pendientes</Text>
                {paymentOptions.map(payment => (
                    <TouchableOpacity
                        key={payment.id}
                        style={styles.paymentCard}
                        onPress={() => handlePayment(payment)}
                    >
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentDescription}>{payment.description}</Text>
                            <Text style={styles.paymentAmount}>$ {payment.amount}</Text>
                        </View>
                        <MaterialIcons name="payment" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderInscriptionForm = () => (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.sectionTitle}>Nueva Inscripción</Text>

                <TextInput
                    style={[styles.input, errors.studentName && styles.inputError]}
                    placeholder="Nombre y Apellido del Alumno"
                    value={formData.studentName}
                    onChangeText={(text) => setFormData({ ...formData, studentName: text })}
                />
                {errors.studentName && <Text style={styles.errorText}>{errors.studentName}</Text>}

                <TextInput
                    style={[styles.input, errors.age && styles.inputError]}
                    placeholder="Edad"
                    keyboardType="numeric"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                />
                {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Género:</Text>
                    <Picker
                        selectedValue={formData.gender}
                        style={styles.picker}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                        <Picker.Item label="Masculino" value="masculino" />
                        <Picker.Item label="Femenino" value="femenino" />
                    </Picker>
                </View>

                <Text style={styles.sectionTitle}>Datos del Tutor</Text>

                <TextInput
                    style={[styles.input, errors.parentName && styles.inputError]}
                    placeholder="Nombre y Apellido del Tutor"
                    value={formData.parentName}
                    onChangeText={(text) => setFormData({ ...formData, parentName: text })}
                />
                {errors.parentName && <Text style={styles.errorText}>{errors.parentName}</Text>}

                <TextInput
                    style={[styles.input, errors.phoneNumber && styles.inputError]}
                    placeholder="Número de Teléfono (10 dígitos)"
                    keyboardType="phone-pad"
                    value={formData.phoneNumber}
                    onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                />
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <MaterialCommunityIcons name="soccer" size={24} color="white" />
                    <Text style={styles.submitButtonText}>Enviar Inscripción</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setCurrentScreen('login')}
                >
                    <Text style={styles.secondaryButtonText}>Volver al Inicio</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.header}
            >      <Image
                    source={{ uri: 'https://api.a0.dev/assets/image?text=el%20semillero%20soccer%20school%20logo&aspect=1:1' }}
                    style={styles.logo}
                    onError={() => console.log('Error loading image')}
                />
                <Text style={styles.headerTitle}>El Semillero</Text>
                <Text style={styles.headerSubtitle}>Escuela de Fútbol Infantil</Text>
            </LinearGradient>

            {currentScreen === 'login' && renderLoginScreen()}
            {currentScreen === 'verify' && renderVerificationScreen()}
            {currentScreen === 'dashboard' && renderDashboard()}
            {currentScreen === 'inscription' && renderInscriptionForm()}

            <Modal
                visible={showPaymentModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirmar Pago</Text>
                        {selectedPayment && (
                            <>
                                <Text style={styles.modalText}>{selectedPayment.description}</Text>
                                <Text style={styles.modalAmount}>$ {selectedPayment.amount}</Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.paymentButton}
                            onPress={processPayment}
                        >
                            <FontAwesome5 name="mercado-pago" size={24} color="white" />
                            <Text style={styles.paymentButtonText}>Pagar con Mercado Pago</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowPaymentModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
    },
    form: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#388E3C',
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    inputError: {
        borderColor: '#ff0000',
    },
    errorText: {
        color: '#ff0000',
        fontSize: 12,
        marginBottom: 10,
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    pickerLabel: {
        paddingHorizontal: 15,
        paddingTop: 10,
        color: '#666',
    },
    picker: {
        height: 50,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    secondaryButton: {
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#4CAF50',
        fontSize: 16,
    },
    infoText: {
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    dashboard: {
        flex: 1,
        padding: 20,
    },
    dashboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#388E3C',
    },
    logoutButton: {
        padding: 10,
    },
    section: {
        marginBottom: 20,
    },
    announcementCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#388E3C',
    },
    announcementDescription: {
        color: '#666',
        marginTop: 5,
    },
    announcementDate: {
        color: '#999',
        fontSize: 12,
        marginTop: 5,
    },
    paymentCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentDescription: {
        fontSize: 16,
        color: '#333',
    },
    paymentAmount: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    modalAmount: {
        fontSize: 24,
        color: '#4CAF50',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    paymentButton: {
        backgroundColor: '#009EE3',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    paymentButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    cancelButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
});

export default ElSemilleroApp;