import { View, Text, TouchableOpacity, Alert } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

type Summary = {
  balance: number | string;
  " Meal Rate": number | string;
  "Total expenses": number | string;
};

type BalanceCardProps = {
  summary: Summary;
};

export const BalanceCard = ({ summary }: BalanceCardProps) => {


  const handleDeposits = () => {
    Alert.alert("Deposits", "Navigate to Deposits Screen");
  };



  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceCardInnerBorder}>
      <Text style={styles.balanceTitle}>Total Balance</Text>
      <Text style={styles.balanceAmount}>
        ৳{parseFloat(summary.balance.toString()).toFixed(2)}
      </Text>

      <View style={styles.balanceStats}>
            <View style={styles.balanceStatItem}>
                <Text style={styles.balanceStatLabel}>Meal Rate</Text>
                <Text style={[styles.balanceStatAmount, { color: COLORS.income }]}>
                    +৳{Math.abs(parseFloat(summary[" Meal Rate"].toString())).toFixed(2)}
                </Text>
            </View>

            <View style={[styles.balanceStatItem, styles.statDivider]} />

          <View style={styles.balanceStatItem}>
            <Text style={styles.balanceStatLabel}>Total expenses</Text>
            <Text style={[styles.balanceStatAmount, { color: COLORS.expense }]}>
                -৳{Math.abs(parseFloat(summary["Total expenses"].toString())).toFixed(2)}
            </Text>
          </View>
      </View>

    </View>
      <View style={styles.noteButtonsContainer}>
        <TouchableOpacity
          style={styles.noteSaveButton}
          onPress={handleDeposits}
        >
          <Text style={styles.noteSaveButtonText}>Add Money</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};