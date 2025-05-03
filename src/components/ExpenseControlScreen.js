import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, useWindowDimensions,
  ActivityIndicator, FlatList, ScrollView
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Auth } from 'aws-amplify';
import { API_URL_SUMMARY } from '@env';

// Quitar datos de ejemplo del gráfico (dataChart)

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

  // --- Obtener datos (useEffect sin cambios internos) ---
  useEffect(() => {
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

            console.log(`Fetching data from: ${apiUrl}`);
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
                }
            });

            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("API Error Body:", errorBody);
                throw new Error(`Error ${response.status}: ${response.statusText || 'Fallo al obtener datos'}`);
            }

            const data = await response.json();
            console.log("Data received:", data);
    
            if (typeof data?.balance?.currentBalance !== 'number' || !Array.isArray(data?.movements)) {
                console.error("Estructura de datos inesperada:", data);
                throw new Error("Formato de datos recibido inválido.");
            }

            setSummaryData({ 
                balance: data.balance.currentBalance, 
                movements: data.movements 
            });

        } catch (err) {
            console.error("Error fetching summary data:", err);
            setError(err.message || "Ocurrió un error al cargar los datos.");
        } finally {
            setLoading(false);
        }
        };

    fetchSummaryData();
  }, []);

  // --- AJUSTE: Calcular datos para el gráfico con useMemo ---
  const pieChartData = useMemo(() => {
    if (!summaryData.movements || summaryData.movements.length === 0) {
      // Retornar datos por defecto o vacíos si no hay movimientos
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
    // Añadir solo si hay valor, para evitar errores en el gráfico con valor 0
    if (totalIncome > 0) {
        data.push({
            name: "Ingresos",
            population: totalIncome,
            color: "#4CAF50", // Verde
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        });
    }
    if (totalExpenses > 0) {
        data.push({
            name: "Gastos",
            population: totalExpenses,
            color: "#F44336", // Rojo
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        });
    }
    
    // Si ambos son 0 (o no hay datos), devolver el default
    if (data.length === 0) {
         return [
            { name: "Sin Datos", population: 1, color: '#cccccc', legendFontColor: "#7F7F7F", legendFontSize: 15 },
         ];
    }

    return data;
  }, [summaryData.movements]); // Dependencia: recalcular solo si los movimientos cambian
  // --- FIN AJUSTE ---

  // --- RENDERIZADO TABLA ---
  const renderMovementItem = ({ item }) => {
    const isIncome = item.type === 'ingreso';
    const displayAmount = Math.abs(item.amount || 0).toFixed(2);
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
    
    // Capitalizar el tipo para mostrarlo
    const displayType = item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'N/A';

    return (
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.descriptionCell]}>{item.category || 'N/A'}</Text>
        <Text style={[styles.tableCell, styles.typeCell]}>{displayType}</Text>
        <Text style={[
          styles.tableCell,
          styles.amountCell,
          amountStyle
        ]}>
          {displaySign}${displayAmount}
        </Text>
        <Text style={[styles.tableCell, styles.dateCell]}>
          {displayDate}
        </Text>
      </View>
    );
  };
  // --- FIN RENDERIZADO TABLA ---

  return (
    // Usar ScrollView si el contenido puede exceder la altura
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Resumen Financiero</Text>

        {/* --- AJUSTE: Usar datos dinámicos en PieChart --- */}
        <PieChart
          data={pieChartData} // Usar los datos calculados
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute // Mostrar valores absolutos (puedes quitarlo si prefieres porcentajes)
          // Considerar quitar `absolute` si los números son muy grandes y se solapan
        />
        {/* --- FIN AJUSTE --- */}

        {/* --- Sección Saldo y Tabla --- */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Saldo y Movimientos</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>Error: {error}</Text>
          ) : (
            <>
              {/* Saldo */}
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Saldo Actual:</Text>
                <Text style={[
                  styles.balanceAmount,
                  summaryData.balance >= 0 ? styles.incomeText : styles.expenseText
                ]}>
                  ${summaryData.balance.toFixed(2)}
                </Text>
              </View>

              {/* Tabla de Movimientos */}
              <View style={styles.tableContainer}>
                {/* Cabecera Tabla */}
                 <View style={styles.tableHeader}>
                   <Text style={[styles.tableHeaderCell, styles.descriptionHeaderCell]}>Categoría</Text>
                   <Text style={[styles.tableHeaderCell, styles.typeHeaderCell]}>Tipo</Text>
                   <Text style={[styles.tableHeaderCell, styles.amountHeaderCell]}>Monto</Text>
                   <Text style={[styles.tableHeaderCell, styles.dateHeaderCell]}>Fecha</Text> {/* Nueva columna Fecha */}
                 </View>
                {/* Cuerpo Tabla (FlatList) */}
                {summaryData.movements && summaryData.movements.length > 0 ? (
                  <FlatList
                    data={summaryData.movements}
                    renderItem={renderMovementItem}
                    // Usar movementId como key
                    keyExtractor={(item) => item.movementId}
                    // nestedScrollEnabled={true} // Descomentar si hay problemas de scroll dentro de ScrollView
                  />
                ) : (
                  <Text style={styles.noMovementsText}>No hay movimientos registrados.</Text>
                )}
              </View>
            </>
          )}
        </View>
        {/* --- Fin Sección Saldo y Tabla --- */}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Permite que el contenido crezca
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Un fondo ligeramente gris
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40', // Color oscuro para el título principal
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
    marginBottom: 20, // Añadir espacio al final
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600', // Semibold
    marginBottom: 15,
    color: '#007BFF', // Azul para el título de sección
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
    marginBottom: 20, // Espacio si solo se muestra el loader
  },
  errorText: {
    color: '#dc3545', // Rojo Bootstrap para errores
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20, // Espacio si solo se muestra el error
    fontSize: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#e9ecef', // Fondo gris claro para destacar saldo
    borderRadius: 6,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '500', // Medium
    color: '#495057', // Gris oscuro
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tableContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#dee2e6', // Borde gris claro
    borderRadius: 6,
    overflow: 'hidden', // Para que el borderRadius afecte a las filas
    maxHeight: 400, // Limitar altura de la tabla para evitar scroll excesivo
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA500', // Cambiar a naranja
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    color: '#fff', // Texto blanco
    fontWeight: 'bold',
    fontSize: 15, // Reducir un poco para que quepan 4 columnas
  },
   // Ajustar flex para 4 columnas
   descriptionHeaderCell: {
     flex: 3,
     textAlign: 'left',
   },
   typeHeaderCell: { // Nueva cabecera para Tipo
    flex: 2,
    textAlign: 'center',
   },
   amountHeaderCell: {
     flex: 2,
     textAlign: 'right',
   },
   dateHeaderCell: { // Estilo para cabecera de Fecha
     flex: 2,
     textAlign: 'center',
   },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef', // Separador de fila más suave
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff', // Fondo blanco para filas
    alignItems: 'center', // Centrar verticalmente el contenido de la fila
  },
  tableCell: {
    fontSize: 14, // Ligeramente más pequeño para más datos
    color: '#495057', // Gris oscuro para texto de celda
  },
   // Ajustar flex para 4 columnas
   descriptionCell: {
     flex: 3,
     textAlign: 'left',
   },
   typeCell: { // Nueva celda para Tipo
     flex: 2,
     textAlign: 'center',
   },
   amountCell: {
     flex: 2,
     textAlign: 'right',
     fontWeight: '500',
   },
   dateCell: { // Estilo para celda de Fecha
     flex: 2,
     textAlign: 'center',
     fontSize: 13, // Aún más pequeño para la fecha
     color: '#6c757d', // Gris secundario
   },
  incomeText: {
    color: '#28a745', // Verde Bootstrap para ingresos
  },
  expenseText: {
    color: '#dc3545', // Rojo Bootstrap para gastos
  },
  noMovementsText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#6c757d', // Gris secundario
  }
});

export default ExpenseControlScreen; 