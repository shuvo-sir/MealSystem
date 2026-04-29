import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";


export const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 20,
        paddingBottom: 0,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,   
        paddingHorizontal: 0,
        paddingVertical: 12,
    },
    headerLeft: {
        flex: 1, 
        flexDirection: "row",
        alignItems: "center",
    },
    headerLogo: {
        width: 75,
        height: 75,
    },
    welcomeContainer: {
        flex: 1, 
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 2,
        color: COLORS.text,
    },
    usernameText: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.text,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    addButton: {
        flexDirection: "row",
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        justifyContent: "center",

    },
    addButtonText: {
        color: COLORS.white,
        marginLeft: 4,
        fontWeight: "600",
        textAlign: "center",
    },
    balanceCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    balanceTitle: {
        fontSize: 16,
        color: COLORS.textLight,
        fontWeight: "500",
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: "700",
        marginBottom: 20,
    },
    balanceStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    balanceStatItem: {
        flex: 1,
        alignItems: "center",
    },
    statDivider: {
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  balanceStatLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  balanceStatAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
})