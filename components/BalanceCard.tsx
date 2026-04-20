import { View, Text } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

type Summary = {
  balance: number | string;
  income: number | string;
  expenses: number | string;
};

type BalanceCardProps = {
  summary: Summary;
};

export const BalanceCard = ({ summary }: BalanceCardProps) => {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>Total Balance</Text>
      <Text style={styles.balanceAmount}>
        ${parseFloat(summary.balance.toString()).toFixed(2)}
      </Text>

      <View style={styles.balanceStats}>
            <View style={styles.balanceStatItem}>
                <Text style={styles.balanceStatLabel}>Income</Text>
                <Text style={[styles.balanceStatAmount, { color: COLORS.income }]}>
                    +${parseFloat(summary.income.toString()).toFixed(2)}
                </Text>
            </View>

            <View style={[styles.balanceStatItem, styles.statDivider]} />

            <View style={styles.balanceStatItem}>
            <Text style={styles.balanceStatLabel}>Expenses</Text>
            <Text style={[styles.balanceStatAmount, { color: COLORS.expense }]}>
                -${Math.abs(parseFloat(summary.expenses.toString())).toFixed(2)}
            </Text>
            </View>
      </View>
    </View>
  );
};