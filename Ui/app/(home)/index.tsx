import React, { useMemo, useState } from "react";
import { useUser } from "@clerk/expo";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { NoGroupScreen } from "@/shared/components/NoGroupScreen";
import { DashboardScreen } from "@/shared/components/DashboardScreen";
import { useDashboard } from "@/shared/hooks/useDashboard";
import { joinMeal } from "@/api/meal.api";
import { useAuth } from "@clerk/expo";
import { GroupAction } from "@/shared/types/homeScreen.types";

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();

  // Dashboard hook manages all data state and actions
  const {
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
    loadDashboard,
    handleGroupSubmit,
    handleSaveMealEntry,
    handleAddNote,
    handleDeleteNote,
    handleLeaveGroup,
  } = useDashboard();

  // Component-level state for form fields and UI
  const [groupAction, setGroupAction] = useState<GroupAction>(null);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedMeals, setSelectedMeals] = useState<number[]>([]);
  const [noteMessage, setNoteMessage] = useState("");
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);

  const userName = useMemo(
    () =>
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "User",
    [
      user?.emailAddresses,
      user?.firstName,
      user?.lastName,
      user?.username,
    ]
  );

  const handleGroupActionSubmit = async () => {
    if (!groupAction) {
      return;
    }

    await handleGroupSubmit(groupAction, groupName, inviteCode, () => {
      // Reset form after successful group creation/join
      setGroupName("");
      setInviteCode("");
      setGroupAction(null);
      setSelectedMeals([]);
      setNoteMessage("");
    });
  };

  const handleMealSelect = (mealId: number) => {
    if (todayEntry) {
      return;
    }

    setSelectedMeals((current) =>
      current.includes(mealId)
        ? current.filter((id) => id !== mealId)
        : [...current, mealId]
    );
  };

  const handleSaveMeal = async () => {
    await handleSaveMealEntry(selectedMeals);
    setSelectedMeals([]);
  };

  const handleAddNoteAction = async () => {
    await handleAddNote(noteMessage);
    setNoteMessage("");
  };

  const handleJoinGroupAction = async (data: { inviteCode: string }) => {
    const token = await getToken();
    return joinMeal(data, token);
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show no group screen
  if (!mealGroup) {
    return (
      <NoGroupScreen
        groupAction={groupAction}
        groupName={groupName}
        inviteCode={inviteCode}
        isLoading={actionLoading}
        onSetGroupAction={setGroupAction}
        onSetGroupName={setGroupName}
        onSetInviteCode={setInviteCode}
        onGroupSubmit={handleGroupActionSubmit}
        avatarImageFailed={avatarImageFailed}
        onAvatarImageFailed={setAvatarImageFailed}
        userName={userName}
      />
    );
  }

  // Show dashboard screen
  return (
    <DashboardScreen
      backendUser={backendUser}
      mealGroup={mealGroup}
      members={members}
      entries={entries}
      notesList={notesList}
      selectedMeals={selectedMeals}
      noteMessage={noteMessage}
      todayEntry={todayEntry}
      isActionLoading={actionLoading}
      refreshing={refreshing}
      errorMessage={errorMessage}
      onMealSelect={handleMealSelect}
      onSaveMealEntry={handleSaveMeal}
      onNoteMessageChange={setNoteMessage}
      onAddNote={handleAddNoteAction}
      onDeleteNote={handleDeleteNote}
      onRefresh={() => loadDashboard(false)}
      avatarImageFailed={avatarImageFailed}
      onAvatarImageFailed={setAvatarImageFailed}
      userName={userName}
      onLeaveGroup={handleLeaveGroup}
      onJoinGroup={handleJoinGroupAction}
    />
  );
}
