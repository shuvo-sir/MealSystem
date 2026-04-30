import { View, Text } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

type Summary = {
  balance: number | string;
  "Total Meal": number | string;
  "Total expenses": number | string;
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
                <Text style={styles.balanceStatLabel}>Total Meal</Text>
                <Text style={[styles.balanceStatAmount, { color: COLORS.income }]}>
                    {(summary["Total Meal"].toString())}
                </Text>
            </View>

            <View style={[styles.balanceStatItem, styles.statDivider]} />

            <View style={styles.balanceStatItem}>
            <Text style={styles.balanceStatLabel}>Total expenses</Text>
            <Text style={[styles.balanceStatAmount, { color: COLORS.expense }]}>
                -${Math.abs(parseFloat(summary["Total expenses"].toString())).toFixed(2)}
            </Text>
            </View>
      </View>
    </View>
  );
};