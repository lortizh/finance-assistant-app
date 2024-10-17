// expense_component.js

import { Alert, Button, ScrollView, Text, View } from "react-native";
import styles from "../../styles";

export default function ExpenseComponent({
	expenses,
	setExpenses,
	chartData,
	setChartData,
}) {
	return (
		<ScrollView
			style={{
				marginBottom: 80,
			}}
		>
			{expenses.map((expense) => {
				console.log(expense);
				return (
					<ExpenseListTile
						key={expense.id}
						expense={expense}
						chartData={chartData}
						expenses={expenses}
						setChartData={setChartData}
						setExpenses={setExpenses}
					/>
				);
			})}
		</ScrollView>
	);
}
const ExpenseListTile = ({
	expense,
	expenses,
	setExpenses,
	chartData,
	setChartData,
}) => {
	return (
		<View style={styles.expenseTile}>
			<Text style={styles.expenseTileText}>{expense.name}</Text>
			<Text style={styles.expenseTileText}>{expense.category}</Text>
			<Text style={styles.expenseTileText}>{expense.amount}</Text>
			<Button
				onPress={() => {
					Alert.alert("Delete", "Are you sure you want to delete?", [
						{
							text: "Yes",
							onPress: () => {
								let newExpenses = [...expenses];
								let index = newExpenses.findIndex(
									(item) => item.id == expense.id
								);
								newExpenses.splice(index, 1);
								setExpenses(newExpenses);
								let newChartData = [...chartData];
								let index2 = newChartData.findIndex(
									(item) => item.name == expense.category
								);
								newChartData[index2].amount -= expense.amount;
								setChartData(newChartData);
							},
						},
						{
							text: "No",
							onPress: () => {
								console.log("No");
							},
						},
					]);
				}}
				title="Delete"
			/>
		</View>
	);
};
