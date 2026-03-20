import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserService from "@/services/user.service";
import { useProfile } from "@/hooks/useProfile";
import { useUserStore } from "@/store/user.store";
import { toast } from "sonner";

const UpdateProfile = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const setAuthUser = useUserStore((state) => state.setAuthUser);
  const setUser = useUserStore((state) => state.setUser);
  const [displayName, setDisplayName] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [tippersPublic, setTippersPublic] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.user?.displayName ?? "");
    setTwitterUrl(profile?.user?.twitterUrl ?? "");
    setTippersPublic(Boolean(profile?.user?.tippersPublic));
  }, [
    profile?.user?.displayName,
    profile?.user?.twitterUrl,
    profile?.user?.tippersPublic,
  ]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      UserService.updateUserProfile({
        displayName: displayName.trim() || null,
        twitterUrl: twitterUrl.trim() || null,
        tippersPublic,
      }),
    onSuccess: (response) => {
      setAuthUser(response.user);
      setUser(response.user);
      queryClient.setQueryData(["userProfile"], response);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to update profile.");
    },
  });

  return (
    <div className="space-y-4 pt-4">
      <Input
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={80}
        className="border-white/10 bg-gray-900/50 text-white !py-4"
      />

      <Input
        placeholder="Twitter/X profile URL or @handle"
        value={twitterUrl}
        onChange={(e) => setTwitterUrl(e.target.value)}
        className="border-white/10 bg-gray-900/50 text-white !py-4"
      />

      <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-gray-900/50 px-4 py-3 text-sm text-white">
        <span>Show my tippers on my public profile</span>
        <input
          type="checkbox"
          checked={tippersPublic}
          onChange={(e) => setTippersPublic(e.target.checked)}
          className="h-4 w-4"
        />
      </label>

      <Button
        onClick={() => updateProfileMutation.mutate()}
        className="w-full"
        disabled={updateProfileMutation.isPending}
      >
        {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
};

export default UpdateProfile;
