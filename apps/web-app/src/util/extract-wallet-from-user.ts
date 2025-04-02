import { UserService } from "@/services";

const extractWalletFromUser = async (userName: string) => {
  try {
    const response = await UserService.fetchAllPotatoeUsers();
    return response;
  } catch (error) {
    return null;
  }
};

export { extractWalletFromUser };
