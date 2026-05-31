import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { getMyMealGroup } from "@/api/meal.api";

interface ManagerStatusData {
  isManager: boolean;
  userMealGroupId: string | null;
  mealGroupData: any;
  isLoading: boolean;
}

/**
 * Custom hook to manage manager status and meal group data
 * Prevents infinite re-renders by using useCallback and useRef
 * Ensures single API call to /api/meals/my-group
 */
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

  const checkManagerStatus = useCallback(async () => {
    // Prevent multiple calls
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
            dashboardData.mealGroup?.manager === dashboardData.user?._id,
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

  // Single effect to call checkManagerStatus once
  useEffect(() => {
    if (user?.id) {
      checkManagerStatus();
    }
  }, [user?.id]); // Only depend on user.id, not getToken

  return data;
};
