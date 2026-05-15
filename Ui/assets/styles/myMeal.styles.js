// styles/create.styles.js
import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";


export const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: COLORS.background,
    },
    mealTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.text,
    },
    content: {
        padding: 20,
        paddingBottom: 0,
    },
    mealHeader: {
        jusrtifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
    avatarImage: {
        width: 75,
        height: 75,
        borderRadius: 37.5,
    },
    avatarImageFailed: {
        width: 75,
        height: 75,
        borderRadius: 37.5,
        backgroundColor: COLORS.primary,
    },
    userName: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: "600",
    },
    email: {
        fontSize: 13,
        color: COLORS.textLight,
    },
    balanceCard: {
        backgroundColor: COLORS.card,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 12,
        marginTop: 20,
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    balanceInnerBorder: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 15,
    },
    balanceComponent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    balanceGroup: {
        alignItems: "center",
        gap: 4,
    },
    balanceTitle: {
        fontSize: 15,
        color: COLORS.textLight,
        fontWeight: "500",
    },
    balanceAmount: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: "bold",
    },
    balanceDueAmount: {
        fontSize: 15,
        color: COLORS.expense,
        fontWeight: "500",
    },
    totalMealDetailsTitle: {
        fontSize: 25,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 10,
        marginTop: 20,
    },
    totalMealDetails: {
        backgroundColor: COLORS.card,
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
    NameCell: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    width: 50,
    },
    totalCell: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.income,
    width: 50,
    textAlign: 'center',
    },
    dayBox: {
    width: 30,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
    borderRadius: 4,
    justifyContent: 'center',
    },
    mealHeader: {
        justifyContent: "center", // Fixed typo here
        alignItems: "center",
        gap: 5,
    },
    dayText: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        color: COLORS.text 
    },
    dayNumber: { 
        fontSize: 8, 
        color: COLORS.textLight, 
        textAlign: 'center' 
    },

})