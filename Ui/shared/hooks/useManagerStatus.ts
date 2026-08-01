import { useCallback, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { useFocusEffect } from "@react-navigation/native";
import { getMyMealGroup } from "@/api/meal.api";

interface ManagerStatusData {
  isManager: boolean;
  userMealGroupId: string | null;
  mealGroupData: any;
  isLoading: boolean;
}

export const useManagerStatus = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const hasCalledRef = useRef(false);

  const [data, setData] = useState<ManagerStatusData>({
    isManager: false,
    userMealGroupId: null,
    mealGroupData: null,
    isLoading: true,
  });

  const checkManagerStatus = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      hasCalledRef.current = false;
    }

    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    try {
      const token = await getToken();
      if (!token) {
        console.error("No authentication token available");
        setData((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const dashboardData = await getMyMealGroup(token);

      if (dashboardData?.mealGroup?._id) {
        setData({
          isManager:
            dashboardData.user?.role === "manager" ||
            dashboardData.mealGroup?.manager?.toString() === dashboardData.user?._id?.toString(),
          userMealGroupId: dashboardData.mealGroup._id,
          mealGroupData: dashboardData.mealGroup,
          isLoading: false,
        });
      } else {
        setData({
          isManager: false,
          userMealGroupId: null,
          mealGroupData: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error checking manager status:", error);
      setData({
        isManager: false,
        userMealGroupId: null,
        mealGroupData: null,
        isLoading: false,
      });
    }
  }, [getToken]);

  const refreshManagerStatus = useCallback(async () => {
    hasCalledRef.current = false;
    await checkManagerStatus(true);
  }, [checkManagerStatus]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        checkManagerStatus();
      }
    }, [user?.id, checkManagerStatus])
  );

  return {
    ...data,
    refreshManagerStatus,
  };
};
