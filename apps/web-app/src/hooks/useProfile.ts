import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services";
import { useUserStore } from "@/store/user.store";
import useAuth from "@/hooks/useAuth";
import type { UserProfileResponse } from "@/services/user.service";

export function useProfile() {
  const setAuthUser = useUserStore((state) => state.setAuthUser);
  const { isAuthenticated, isLoading: sessionLoading } = useAuth();

  const { data: profile, isLoading } = useQuery<UserProfileResponse>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await UserService.fetchUserProfile();
      if (response?.user) {
        setAuthUser(response.user);
      }

      return response;
    },
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated && !sessionLoading,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 0,
  });

  return {
    profile,
    isLoading: isLoading || sessionLoading,
  };
}
