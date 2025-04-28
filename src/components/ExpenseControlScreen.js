import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

// Datos de ejemplo para el gráfico
const data = [
  {
    name: "Ingresos",
    population: 5000,
    color: "#4CAF50", // Verde
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Gastos",
    population: 3500,
    color: "#F44336", // Rojo
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
];

const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Color base para etiquetas, etc.
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const ExpenseControlScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Ingresos vs. Gastos</Text>
      <PieChart
        data={data}
        width={screenWidth - 40} // Ancho del gráfico (ajustado al padding)
        height={220}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        // center={[10, 10]} // Descomentar y ajustar si es necesario centrar
        absolute // Muestra los valores absolutos en el gráfico
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ExpenseControlScreen; 