import { View, Text } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

type Summary = {
  balance: number | string;
  mealRate: number | string;
  totalExpenses: number | string;
};

type BalanceCardProps = {
  summary: Summary;
};

  const money = (value: number | string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

export const BalanceCard = ({ summary }: BalanceCardProps) => {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceCardInnerBorder}>
        <Text style={styles.balanceTitle}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          BDT {money(summary.balance)}
        </Text>

        <View style={styles.balanceStats}>
          <View style={styles.balanceStatItem}>
            <Text style={styles.balanceStatLabel}>Meal Rate</Text>
            <Text
              style={[
                styles.balanceStatAmount,
                { color: COLORS.income },
              ]}
            >
              BDT {money(summary.mealRate)}
            </Text>
          </View>

          <View style={[styles.balanceStatItem, styles.statDivider]} />

          <View style={styles.balanceStatItem}>
            <Text style={styles.balanceStatLabel}>Total expenses</Text>
            <Text
              style={[
                styles.balanceStatAmount,
                { color: COLORS.expense },
              ]}
            >
              BDT {money(summary.totalExpenses)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
