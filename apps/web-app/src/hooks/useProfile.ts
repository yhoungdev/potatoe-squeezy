import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services";
import { useUserStore } from "@/store/user.store";
import Cookies from "js-cookie";

export function useProfile() {
  const setUser = useUserStore((state) => state.setUser);
  const token = Cookies.get("auth-token");

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', token],
    queryFn: async () => {
      const response = await UserService.fetchUserProfile();
      setUser(response);
      
      return response;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, 
    retry: 1,
  });

  return {
    profile,
    isLoading,
  };
}