import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import {
  addMealEntry,
  createMealGroup,
  getMyMealGroup,
  joinMeal,
} from "@/api/meal.api";
import {
  addGroupNote,
  getGroupNotes,
  deleteGroupNote,
} from "@/api/note.api";
import {
  BackendUser,
  GroupAction,
  GroupNote,
  MealEntry,
  MealGroup,
} from "../types/homeScreen.types";
import { getErrorMessage, getLocalDateKey, getEntryUserId } from "../utils/homeScreenHelpers";

export const useDashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // Track if initial load has been done to prevent infinite loops
  const hasLoadedRef = useRef(false);

  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] = useState<MealGroup | null>(null);
  const [members, setMembers] = useState<BackendUser[]>([]);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [notesList, setNotesList] = useState<GroupNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayKey = useMemo(() => getLocalDateKey(), []);

  const todayEntry = useMemo(
    () =>
      entries.find(
        (entry) =>
          entry.date === todayKey &&
          getEntryUserId(entry) === backendUser?._id
      ),
    [backendUser?._id, entries, todayKey]
  );

  const loadDashboard = useCallback(
    async (showInitialLoader = false) => {
      if (!user?.id) return;

      if (showInitialLoader) setIsLoading(true);
      else setRefreshing(true);

      setErrorMessage(null);

      try {
        const token = await getToken();
        console.log("CLERK TOKEN (loadDashboard):", token ? "✓ Token exists" : "✗ Token is null/undefined");
        
        const dashboard = await getMyMealGroup(token);

        setBackendUser(dashboard.user || null);
        setMealGroup(dashboard.mealGroup || null);
        setMembers(dashboard.members || []);
        setEntries(dashboard.entries || []);

        if (dashboard.mealGroup?._id) {
          const noteData = await getGroupNotes(dashboard.mealGroup._id, token);
          setNotesList(noteData.notes || []);
        } else {
          setNotesList([]);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, getToken]
  );

  // Load dashboard only once on mount when user.id is available
  useEffect(() => {
    if (!user?.id || hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    loadDashboard(true);
  }, [user?.id, loadDashboard]);

  const handleGroupSubmit = useCallback(
    async (
      groupAction: GroupAction,
      groupName: string,
      inviteCode: string,
      onSuccess?: () => void
    ) => {
      if (!groupAction) {
        return;
      }

      if (groupAction === "create" && !groupName.trim()) {
        Alert.alert("Missing group name", "Please enter a group name.");
        return;
      }

      if (groupAction === "join" && !inviteCode.trim()) {
        Alert.alert("Missing invite code", "Please enter an invite code.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        console.log("CLERK TOKEN OBTAINED:", token ? "✓ Token exists" : "✗ Token is null/undefined");
        
        if (!token) {
          Alert.alert("Auth Error", "Failed to get authentication token. Please try again.");
          setActionLoading(false);
          return;
        }

        const response =
          groupAction === "create"
            ? await createMealGroup({ groupName: groupName.trim() }, token)
            : await joinMeal(
                { inviteCode: inviteCode.trim().toUpperCase() },
                token
              );

        setBackendUser(response.user || null);
        setMealGroup(response.mealGroup || null);
        setMembers(response.members || []);
        setEntries(response.entries || []);

        await loadDashboard(false);
        Alert.alert(
          "Success",
          groupAction === "create"
            ? "Meal group created."
            : "Meal group joined."
        );

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [getToken, loadDashboard]
  );

  const handleMealSelect = useCallback((mealId: number) => {
    // This will be handled in the component (UI state)
    // Hook just returns the callback for component to use
  }, []);

  const handleSaveMealEntry = useCallback(
    async (selectedMeals: number[]) => {
      if (!backendUser || !mealGroup) {
        Alert.alert("Join a group", "Create or join a meal group first.");
        return;
      }

      if (selectedMeals.length === 0) {
        Alert.alert("Select meal", "Please select at least one meal.");
        return;
      }

      if (todayEntry) {
        Alert.alert("Already added", "Your meals are saved for today.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        await addMealEntry(
          {
            userId: backendUser._id,
            date: todayKey,
            breakfast: selectedMeals.includes(1) ? 1 : 0,
            lunch: selectedMeals.includes(2) ? 1 : 0,
            dinner: selectedMeals.includes(3) ? 1 : 0,
          },
          token
        );

        await loadDashboard(false);
        Alert.alert("Success", "Meal entry added.");
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [backendUser, mealGroup, todayEntry, todayKey, getToken, loadDashboard]
  );

  const handleAddNote = useCallback(
    async (noteMessage: string) => {
      if (!backendUser || !mealGroup) {
        Alert.alert("Join a group", "Create or join a meal group first.");
        return;
      }

      if (!noteMessage.trim()) {
        Alert.alert("Empty note", "Please enter a note.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        console.log(`[handleAddNote] Adding note to group: ${mealGroup._id}`);
        
        const noteResponse = await addGroupNote(
          {
            userId: backendUser._id,
            message: noteMessage.trim(),
          },
          token
        );

        console.log(`[handleAddNote] Note created successfully:`, noteResponse.note);

        const noteData = await getGroupNotes(mealGroup._id, token);
        setNotesList(noteData.notes || []);
        console.log(`[handleAddNote] Notes list refreshed with ${noteData.notes?.length || 0} notes`);
      } catch (error) {
        console.log(`[handleAddNote] Error:`, error);
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [backendUser, mealGroup, getToken]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      setActionLoading(true);

      try {
        const token = await getToken();
        console.log(`[handleDeleteNote] Deleting note: ${noteId}`);
        
        await deleteGroupNote(noteId, token);

        console.log(`[handleDeleteNote] Note deleted successfully`);

        // Remove from local state
        setNotesList((current) =>
          current.filter((note) => note._id !== noteId)
        );
        Alert.alert("Success", "Note deleted.");
      } catch (error) {
        console.log(`[handleDeleteNote] Error:`, error);
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [getToken]
  );

  return {
    // State
    backendUser,
    mealGroup,
    members,
    entries,
    notesList,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    todayEntry,

    // Handlers
    loadDashboard,
    handleGroupSubmit,
    handleMealSelect,
    handleSaveMealEntry,
    handleAddNote,
    handleDeleteNote,
  };
};
