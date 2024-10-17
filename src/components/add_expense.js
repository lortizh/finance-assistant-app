// add_expense.js

import { Picker } from "@react-native-picker/picker";
import { Button, Text, TextInput, View } from "react-native";
import styles from "../../styles";

// Define the Addform component which is used to add new expenses
export default function Addform({
	name,
	setName,
	amount,
	setAmount,
	category,
	setCategory,
	categories,
	setExpenses,
	expenses,
	chartData,
	setChartData,
	setAddForm,
}) {
	return (
		<View>
			<Text style={styles.heading3}>Add Form</Text>

			{/* Input field for expense name */}
			<Text style={styles.label}>Expense Name</Text>
			<TextInput
				onChangeText={(value) => setName(value)}
				value={name}
				style={styles.textInput}
				placeholder="Enter the expense name"
			/>

			{/* Input field for expense amount */}
			<Text style={styles.label}>Amount</Text>
			<TextInput
				keyboardType="numeric"
				onChangeText={(value) => {
					// Ensure only numeric values are entered for the amount
					value = value.replace(/[^0-9]/g, "");
					setAmount(value);
				}}
				value={amount}
				style={styles.textInput}
				placeholder="Amount"
			/>

			{/* Dropdown to select expense category */}
			<Text style={styles.label}>Category</Text>
			<Picker
				style={styles.textInput}
				selectedValue={category}
				onValueChange={(itemValue, itemIndex) => setCategory(itemValue)}
			>
				{categories.map((category, index) => {
					return (
						<Picker.Item
							key={index}
							label={category}
							value={category}
						/>
					);
				})}
			</Picker>

			{/* Buttons to add or cancel expense */}
			<View style={styles.row}>
				{/* Add Expense button */}
				<Button
					onPress={() => {
						let amountNumber = parseInt(amount);
						if (amountNumber <= 0 || name == "") {
							// Validation: Ensure valid amount 
							// and name are entered
							alert("Please enter a valid amount and name");
							return;
						}

						// Add the new expense to the list of expenses
						setExpenses([
							...expenses,
							{
								id: new Date().getTime(),
								category,
								name,
								amount: amountNumber,
							},
						]);

						// Update the chart data to reflect the new expense
						let newChartData = [...chartData];
						let index = newChartData.findIndex(
							(item) => item.name == category
						);
						newChartData[index].amount += amountNumber;
						setChartData(newChartData);

						// Reset form fields and close the form
						setAddForm(false);
						setName("");
						setAmount("");
						setCategory("Food");
					}}
					title="Add Expense"
				/>

				{/* Cancel button to close the form
					without adding an expense */}
				<Button
					onPress={() => {
						setAddForm(false);
					}}
					title="Cancel"
				/>
			</View>
		</View>
	);
}
