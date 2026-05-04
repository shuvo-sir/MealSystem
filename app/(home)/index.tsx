import { Image, Text, TouchableOpacity, View, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "@/components/BalanceCard";
import { useUser } from "@clerk/expo";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "@/constants/colors";

export default function HomeScreen() {
  const { user } = useUser();
  const [selectedMeals, setSelectedMeals] = useState<number[]>([]);
  const [mealNotes, setMealNotes] = useState("");
  const [notesList, setNotesList] = useState<Array<{ id: string; text: string; date: string; time: string; timestamp: number }>>([]);

  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";

  const meals = [
    { id: 1, name: "Morning", icon: "sunny" },
    { id: 2, name: "Lunch", icon: "restaurant" },
    { id: 3, name: "Dinner", icon: "moon" },
  ];

  // Load saved notes from AsyncStorage on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const notes = await AsyncStorage.getItem("mealNotesList");
      if (notes) {
        setNotesList(JSON.parse(notes));
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };


  // Format date to show "Today", "Yesterday", or specific date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  };


  // Format time to show in "hh:mm AM/PM" format
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const generateId = () => {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddNote = async () => {
    if (mealNotes.trim() === "") {
      Alert.alert("Empty Note", "Please enter some text before adding.");
      return;
    }

    try {
      const timestamp = Date.now();
      const newNote = {
        id: generateId(),
        text: mealNotes,
        date: formatDate(timestamp),
        time: formatTime(timestamp),
        timestamp,
      };


      // Add new note to the top of the list and save to AsyncStorage
      const updatedNotes = [newNote, ...notesList];
      setNotesList(updatedNotes);
      await AsyncStorage.setItem("mealNotesList", JSON.stringify(updatedNotes));
      setMealNotes("");
      Alert.alert("Success", "Note added successfully!");
    } catch (error) {
      console.error("Error adding note:", error);
      Alert.alert("Error", "Failed to add note.");
    }
  };

  // Delete note with confirmation
  const handleDeleteNote = async (noteId: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const updatedNotes = notesList.filter((note) => note.id !== noteId);
            setNotesList(updatedNotes);
            await AsyncStorage.setItem("mealNotesList", JSON.stringify(updatedNotes));
            // Alert.alert("Success", "Note deleted successfully!");
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Error", "Failed to delete note.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Handle meal selection/deselection
  const handleMealSelect = (mealId: number, mealName: string) => {
    setSelectedMeals((prevSelected) => {
      if (prevSelected.includes(mealId)) {
        return prevSelected.filter((id) => id !== mealId);
      } else {
        return [...prevSelected, mealId];
      }
    });
  };


  // Get names of selected meals for display
  const getSelectedMealNames = () => {
    return meals
      .filter((meal) => selectedMeals.includes(meal.id))
      .map((meal) => meal.name)
      .join(", ");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={[styles.headerLogo, { borderRadius: 50 }]}
                />
              ) : (
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.headerLogo}
                />
              )}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.usernameText}>{userName}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.addButton} onPress={() => alert("Add Money")}>
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Card Section */}
          <BalanceCard summary={{ balance: 1000, " Meal Rate": 75, "Total expenses": 1000 }} />

          {/* Meal Selection Section */}
          <Text style={styles.mealSectionTitle}>Add Your Meal</Text>
          <View style={styles.mealCardsContainer}>
            {meals.map((meal) => {
              const isSelected = selectedMeals.includes(meal.id);
              return (
                <TouchableOpacity
                  key={meal.id}
                  style={[styles.mealCard, isSelected && styles.mealCardSelected]}
                  onPress={() => handleMealSelect(meal.id, meal.name)}
                >
                  <Ionicons
                    name={meal.icon as any}
                    size={32}
                    color={isSelected ? "#fff" : "#FF8C42"}
                    style={styles.mealCardIcon}
                  />
                  <Text style={[styles.mealCardText, isSelected && styles.mealCardTextSelected]}>
                    {meal.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Meals Display */}
          {selectedMeals.length > 0 && (
            <View style={styles.selectedMealsContainer}>
              <Text style={styles.selectedMealsText}>Selected: {getSelectedMealNames()}</Text>
            </View>
          )}

          {/* Meal Notes Section */}
          <Text style={styles.noteSectionTitle}>Meal Notes</Text>
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Need Eggs, Onions 🧅🍳"
              placeholderTextColor={COLORS.textLight}
              multiline={true}
              numberOfLines={4}
              value={mealNotes}
              onChangeText={setMealNotes}
            />
            <View style={styles.noteButtonsContainer}>
              <TouchableOpacity
                style={styles.noteSaveButton}
                onPress={handleAddNote}
              >
                <Text style={styles.noteSaveButtonText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes List Section */}
          <View style={styles.notesListContainer}>
            {notesList.length > 0 ? (
              <>
                <Text style={styles.notesListTitle}>My Notes ({notesList.length})</Text>
                {notesList.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <View style={styles.noteItemHeader}>
                      <View style={styles.noteItemContent}>
                        <Text style={styles.noteItemText}>{note.text}</Text>
                        <Text style={styles.noteItemTimestamp}>
                          📅 {note.date} • ⏰ {note.time}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.noteDeleteButton}
                        onPress={() => handleDeleteNote(note.id)}
                      >
                        <Ionicons name="trash" size={18} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.emptyNotesText}>No notes yet. Add one to get started! 📝</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
