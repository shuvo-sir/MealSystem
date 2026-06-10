import { View, Text } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

type Summary = {
  balance: number | string;
  mealRate: number | string;
  totalExpenses: number | string;
  totalDeposit: number | string;
};

type BalanceCardProps = {
  summary: Summary;
  groupName: string;
};

const money = (value: number | string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

export const BalanceCard = ({ summary, groupName }: BalanceCardProps) => {
  // Calculate net balance: Total Deposit - Total Expenses
  const netBalance = Number(summary.totalDeposit) - Number(summary.totalExpenses);

  return (
    <View style={styles.balanceCard}>
      
      {groupName && (
        <Text style={styles.groupName}>{groupName}</Text>
      )}
      <View style={styles.balanceStats}>

        {/* Lest side balance  */}
        <View>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.balanceStatLabel}>Total balance</Text>
            <Text style={styles.balanceStatAmount}>
              BDT {money(summary.balance)}
            </Text>
          </View>
          
          <View>
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
        </View>

        
        {/* Divider of the balance card section */}
        <View style={[{ alignItems: "center"}, styles.statDivider]} />

        {/* Right side balance */}
        <View>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.balanceStatLabel}>Net Balance</Text>
            <Text
              style={[
                styles.balanceStatAmount,
                { color: netBalance >= 0 ? COLORS.income : COLORS.expense },
              ]}
            >
              BDT {money(netBalance)}
            </Text>
          </View>

          <View>
            <Text style={styles.balanceStatLabel}>Total Expenses</Text>
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


      {/* <View style={styles.balanceCardInnerBorder}> */}
        {/* First Row: Net Balance & Total Deposit */}
        {/* <View style={styles.balanceStats}>
          <View style={styles.balanceStatItem}>

          </View>

            <View style={[{ alignItems: "center"}, styles.statDivider]} />
            
          <View style={styles.balanceStatItem}>

          </View>
        </View>

        {/* Second Row: Meal Rate & Total Expenses */}
        {/* <View style={[styles.balanceStats, { marginTop: 12 }]}>
          <View style={styles.balanceStatItem}>

          </View>

          <View style={[{ alignItems: "center"}, styles.statDivider]} />

          <View style={styles.balanceStatItem}>

          </View>
        </View> 
      </View> */}
    </View>
  );
};
