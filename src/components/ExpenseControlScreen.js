import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, useWindowDimensions,
  ActivityIndicator, FlatList, ScrollView,
  TouchableOpacity, Modal, TextInput
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Auth } from 'aws-amplify';
import { API_URL_SUMMARY, API_URL_EDIT_MOV } from '@env';
import { Picker } from '@react-native-picker/picker';

const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const ExpenseControlScreen = () => {
  const { width } = useWindowDimensions();
  const chartWidth = width - (styles.container.padding * 2 || 40);

  const [summaryData, setSummaryData] = useState({ balance: 0, movements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para el Modal de Edición ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null); // Guarda el objeto movimiento original
  const [editFormData, setEditFormData] = useState({ amount: '', category: '', type: 'gasto' });
  const [isSavingEdit, setIsSavingEdit] = useState(false); // Estado de carga para la edición
  // --- Fin Estados Modal ---

  // --- Función para obtener datos (fetchSummaryData) sin cambios internos, solo se llamará más adelante ---
  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);
    try {
        const userInfo = await Auth.currentAuthenticatedUser();
        const userId = userInfo.attributes.sub;
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        if (!API_URL_SUMMARY) {
            throw new Error("La variable de entorno API_URL_SUMMARY no está definida.");
        }
        const baseUrl = API_URL_SUMMARY.endsWith('/') ? API_URL_SUMMARY.slice(0, -1) : API_URL_SUMMARY;
        const apiUrl = `${baseUrl}/${userId}/summary`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error ${response.status}: ${response.statusText || 'Fallo al obtener datos'} - ${errorBody}`);
        }

        const data = await response.json();
 
        if (typeof data?.balance?.currentBalance !== 'number' || !Array.isArray(data?.movements)) {
            throw new Error("Formato de datos recibido inválido.");
        }

        setSummaryData({ 
            balance: data.balance.currentBalance, 
            movements: data.movements 
        });

    } catch (err) {
        setError(err.message || "Ocurrió un error al cargar los datos.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  // --- Datos para el Gráfico (pieChartData) sin cambios ---
  const pieChartData = useMemo(() => {
    if (!summaryData.movements || summaryData.movements.length === 0) {
      return [
          { name: "Sin Datos", population: 1, color: '#cccccc', legendFontColor: "#7F7F7F", legendFontSize: 15 },
      ]; 
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    summaryData.movements.forEach(item => {
      if (item.type === 'ingreso') {
        totalIncome += item.amount || 0;
      } else if (item.type === 'gasto') {
        totalExpenses += Math.abs(item.amount || 0);
      }
    });

    const data = [];
    const locale = 'es-CO'; // Definir locale para reutilizar
    const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    if (totalIncome > 0) {
        data.push({
            name: `Ingresos: $${totalIncome.toLocaleString(locale, formatOptions)}`,
            population: totalIncome,
            color: "#4CAF50",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        });
    }
    if (totalExpenses > 0) {
        data.push({
            name: `Gastos: $${totalExpenses.toLocaleString(locale, formatOptions)}`,
            population: totalExpenses,
            color: "#F44336",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        });
    }
    
    if (data.length === 0) {
         return [
            { name: "Sin Datos", population: 1, color: '#cccccc', legendFontColor: "#7F7F7F", legendFontSize: 15 },
         ];
    }

    return data;
  }, [summaryData.movements]);

  // --- Funciones para el Modal de Edición ---
  const handleEditPress = (movement) => {
    setEditingMovement(movement);
    setEditFormData({
      amount: movement.amount.toString(), // Convertir a string para TextInput
      category: movement.category,
      type: movement.type,
    });
    setIsEditModalVisible(true);
  };

  const handleEditFormChange = (name, value) => {
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingMovement || isSavingEdit) return;
    setIsSavingEdit(true);
    setError(null); // Limpiar errores previos

    try {
      const userInfo = await Auth.currentAuthenticatedUser();
      const userId = userInfo.attributes.sub;
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      if (!API_URL_EDIT_MOV) {
        throw new Error("La variable de entorno API_URL_EDIT_MOV no está definida.");
      }
      // Construir URL: API_URL_EDIT_MOV/{userId}/movements/{movementId}
      const baseUrl = API_URL_EDIT_MOV.endsWith('/') ? API_URL_EDIT_MOV.slice(0, -1) : API_URL_EDIT_MOV;
      const editApiUrl = `${baseUrl}/${userId}/movements/${editingMovement.movementId}`;

      const amountValue = parseFloat(editFormData.amount);
      if (isNaN(amountValue)) {
        throw new Error("El monto debe ser un número válido.");
      }

      const payload = {
        amount: amountValue,
        category: editFormData.category,
        type: editFormData.type,
      };

      console.log("Saving edit to:", editApiUrl, "Payload:", payload);
      // IMPORTANTE: Asumiendo PUT. Si es GET con cuerpo, es inusual.
      const response = await fetch(editApiUrl, {
        method: 'PUT', // O 'PATCH'. Confirmar si es GET con cuerpo.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error ${response.status}: ${response.statusText || 'Fallo al guardar cambios'} - ${errorBody}`);
      }

      // Si la API ya actualiza el saldo y devuelve los movimientos, no es necesario hacer nada más que refrescar
      console.log("Edición guardada con éxito");
      setIsEditModalVisible(false);
      setEditingMovement(null);
      await fetchSummaryData(); // Recargar todos los datos

    } catch (err) {
      console.error("Error saving edit:", err);
      setError(err.message || "Ocurrió un error al guardar los cambios."); 
      // Mantener el modal abierto en caso de error para que el usuario vea el mensaje
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingMovement(null);
    setError(null); // Limpiar errores al cancelar
  };
  // --- Fin Funciones Modal ---

  // --- Modificar renderMovementItem para añadir botón de Editar ---
  const renderMovementItem = ({ item }) => {
    const isIncome = item.type === 'ingreso';
    const amountValue = Math.abs(item.amount || 0);
    const displayAmount = amountValue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const displaySign = isIncome ? '+' : '-';
    const amountStyle = isIncome ? styles.incomeText : styles.expenseText;
    let displayDate = 'N/A';
    if (item.recordTimestamp) {
      try {
        displayDate = new Date(item.recordTimestamp).toLocaleDateString();
      } catch (e) {
        console.warn("Could not parse date:", item.recordTimestamp);
      }
    }
    const displayType = item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'N/A';

    return (
      <View style={styles.tableRowContainer}> 
        <View style={styles.tableRowContent}> 
            <Text style={[styles.tableCell, styles.descriptionCell]}>{item.category || 'N/A'}</Text>
            <Text style={[styles.tableCell, styles.typeCell]}>{displayType}</Text>
            <Text style={[styles.tableCell, styles.amountCell, amountStyle]}>{displaySign}${displayAmount}</Text>
            <Text style={[styles.tableCell, styles.dateCell]}>{displayDate}</Text>
        </View>
        <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    );
  };
  // --- Fin Modificación ---

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Resumen Financiero</Text>
        <PieChart 
            data={pieChartData} 
            width={chartWidth} 
            height={220} 
            chartConfig={chartConfig}
            accessor={"population"} 
            backgroundColor={"transparent"} 
            paddingLeft={"15"} 
        />

        {/* Modal de Edición */} 
        <Modal
          animationType="slide"
          transparent={true}
          visible={isEditModalVisible}
          onRequestClose={handleCancelEdit}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Movimiento</Text>
              
              <Text style={styles.inputLabel}>Categoría:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.category}
                onChangeText={(text) => handleEditFormChange('category', text)}
                placeholder="Ej: Salario, Comida"
              />

              <Text style={styles.inputLabel}>Monto:</Text>
              <TextInput
                style={styles.input}
                value={editFormData.amount}
                onChangeText={(text) => handleEditFormChange('amount', text)}
                placeholder="Ej: 500.00"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Tipo:</Text>
              <View style={styles.pickerContainer}> 
                <Picker
                  selectedValue={editFormData.type}
                  onValueChange={(itemValue) => handleEditFormChange('type', itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Gasto" value="gasto" />
                  <Picker.Item label="Ingreso" value="ingreso" />
                </Picker>
              </View>

              {error && <Text style={styles.modalErrorText}>{error}</Text>} 

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity onPress={handleCancelEdit} style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveEdit} style={[styles.modalButton, styles.saveButton]} disabled={isSavingEdit}>
                  {isSavingEdit ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.summarySection}>
           <Text style={styles.sectionTitle}>Saldo y Movimientos</Text>
           {loading && !isEditModalVisible ? (
            <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
           ) : error && !editingMovement && !isEditModalVisible ? ( // Mostrar error general solo si no se está editando
            <Text style={styles.errorText}>Error: {error}</Text>
           ) : (
            <>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Saldo Actual:</Text>
                <Text style={[
                  styles.balanceAmount,
                  summaryData.balance >= 0 ? styles.incomeText : styles.expenseText
                ]}>
                  ${(summaryData.balance || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <View style={styles.tableHeaderContent}>
                    <Text style={[styles.tableHeaderCell, styles.descriptionHeaderCell]}>Categoría</Text>
                    <Text style={[styles.tableHeaderCell, styles.typeHeaderCell]}>Tipo</Text> 
                    <Text style={[styles.tableHeaderCell, styles.amountHeaderCell]}>Monto</Text>
                    <Text style={[styles.tableHeaderCell, styles.dateHeaderCell]}>Fecha</Text>
                  </View>
                  <View style={styles.editButtonPlaceholder} />
                </View>
                {summaryData.movements && summaryData.movements.length > 0 ? (
                  <FlatList
                    data={summaryData.movements}
                    renderItem={renderMovementItem}
                    keyExtractor={(item) => item.movementId}
                  />
                ) : (
                  <Text style={styles.noMovementsText}>No hay movimientos registrados.</Text>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, 
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
  },
  summarySection: {
    width: '100%',
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#007BFF',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#495057',
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tableContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    overflow: 'hidden',
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA500',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tableHeaderContent: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 12,
  },
  editButtonPlaceholder: {
    width: 60,
  },
  tableHeaderCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15, 
  },
   descriptionHeaderCell: {
     flex: 3, 
     textAlign: 'left',
   },
   typeHeaderCell: { 
    flex: 2,
    textAlign: 'center',
   },
   amountHeaderCell: {
     flex: 2,
     textAlign: 'right',
   },
   dateHeaderCell: { 
     flex: 2,
     textAlign: 'center',
   },
  tableRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  tableRowContent: { 
    flexDirection: 'row',
    flex: 1, 
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14, 
    color: '#495057',
  },
   descriptionCell: {
     flex: 3,
     textAlign: 'left',
   },
   typeCell: { 
     flex: 2,
     textAlign: 'center',
   },
   amountCell: {
     flex: 2,
     textAlign: 'right',
     fontWeight: '500',
   },
   dateCell: { 
     flex: 2,
     textAlign: 'center',
     fontSize: 13,
     color: '#6c757d',
   },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#007bff',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#28a745',
  },
  expenseText: {
    color: '#dc3545',
  },
  noMovementsText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#6c757d',
  },
  // Estilos para el Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch', // Para que los inputs ocupen el ancho
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  picker: {
    height: 50, 
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1, // Para que ocupen espacio similar
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#28a745', // Verde para guardar
  },
  cancelButton: {
    backgroundColor: '#6c757d', // Gris para cancelar
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalErrorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
});

export default ExpenseControlScreen; 