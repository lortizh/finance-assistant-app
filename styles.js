// styles.js

import { StyleSheet } from "react-native";
// styles sheet to store all the styles in one place
const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-evenly",
	},
	container: {
		backgroundColor: "#fff",
		height: "100%",
		marginTop: 50,
	},
	heading: {
		color: "green",
		fontSize: 30,
		textAlign: "center",
		fontWeight: "bold",
	},
	addButton: {
		padding: 10,
		margin: 10,
	},
	heading2: {
		color: "black",
		fontSize: 25,
		textAlign: "center",
		fontWeight: "bold",
	},
	heading3: {
		color: "black",
		fontSize: 20,
		textAlign: "center",
	},
	label: {
		color: "black",
		fontSize: 16,
		textAlign: "left",
		fontWeight: "bold",
		marginLeft: 10,
	},
	expenseTile: {
		// column with 3 cells
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "lightgrey",
		width: "95%",
		padding: 10,
		margin: 10,
	},
	expenseTileText: {
		fontSize: 20,
		width: "22%",
		textAlign: "center",
	},
	formAdd: {
		// display: "none",
	},
	textInput: {
		borderRadius: 12,
		borderColor: "black",
		borderWidth: 1,
		padding: 10,
		margin: 10,
	},
	balance: {
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 10,
	  },
});
export default styles;
