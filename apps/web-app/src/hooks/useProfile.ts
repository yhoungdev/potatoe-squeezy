import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services";
import { useUserStore } from "@/store/user.store";

export function useProfile() {
  const setAuthUser = useUserStore((state) => state.setAuthUser);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await UserService.fetchUserProfile();
      if (response?.user) {
        setAuthUser(response.user);
      }

      return response;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    profile,
    isLoading,
  };
}
