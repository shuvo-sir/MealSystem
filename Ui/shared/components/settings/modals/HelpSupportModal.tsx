import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

const FAQ_ITEMS = [
  {
    question: "How do I create a meal group?",
    answer:
      "To create a meal group, go to the home screen and tap 'Create Group'. Enter your group name and invite code, then start inviting members.",
  },
  {
    question: "How do I join a meal group?",
    answer:
      "You can join a group by entering the invite code provided by the group manager on the home screen. Select 'Join Group' and enter the code.",
  },
  {
    question: "How are meal expenses calculated?",
    answer:
      "Meal expenses are divided equally among all group members based on the meals logged. The system calculates each member's share automatically.",
  },
  {
    question: "Can I edit my meal entries?",
    answer:
      "Yes, you can edit your meal entries within 24 hours of logging them. Go to 'My Meals' and select the entry you want to modify.",
  },
  {
    question: "How do I view my balance?",
    answer:
      "Your current balance is displayed on the Finance screen. Positive balance means others owe you money, negative means you owe others.",
  },
  {
    question: "Can I remove myself from a group?",
    answer:
      "Yes, you can leave a group by going to Group Info and tapping 'Leave Group'. You won't have access to group meals after leaving.",
  },
];

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  visible,
  onClose,
  isLoading = false,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        if (!isLoading) onClose();
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text }}>
            Help & Support
          </Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        >
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.text,
                marginBottom: 16,
              }}
            >
              Frequently Asked Questions
            </Text>
            {FAQ_ITEMS.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => handleToggleFaq(index)}
                disabled={isLoading}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  marginBottom: 12,
                  backgroundColor:
                    expandedIndex === index ? COLORS.primary + "10" : "transparent",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: COLORS.text,
                      flex: 1,
                      marginRight: 12,
                    }}
                  >
                    {item.question}
                  </Text>
                  <Ionicons
                    name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                {expandedIndex === index && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.textLight,
                      marginTop: 12,
                      lineHeight: 20,
                    }}
                  >
                    {item.answer}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

          <View
            style={{
              backgroundColor: COLORS.primary + "10",
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              <Ionicons name="mail" size={24} color={COLORS.primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: COLORS.text,
                  marginLeft: 12,
                }}
              >
                Need More Help?
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textLight,
                lineHeight: 20,
                marginBottom: 16,
              }}
            >
              If you can't find the answer to your question in our FAQ, please don't hesitate
              to reach out to our support team. We're here to help!
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: COLORS.primary,
              }}
            >
              📧 support@mealapp.com
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>
              MealApp v1.0.0
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.textLight, opacity: 0.6 }}>
              © 2026 All rights reserved
            </Text>
          </View>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          }}
        >
          <Pressable
            onPress={onClose}
            disabled={isLoading}
            style={({ pressed }) => ({
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: COLORS.primary,
              opacity: pressed || isLoading ? 0.7 : 1,
            })}
          >
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.white }}>
              Got it
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
