import DefaultDashboard from "@/layouts/dashboard";
import { motion } from "framer-motion";
import { TAB_STATE } from "@/constant/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralGithubUsers from "@/components/pages/explore/general-users";
import PotatoeUsers from "@/components/pages/explore/potatoe-users";

const tabs = [
  { value: "account", label: "Potatoe Users 🍟", content: <PotatoeUsers /> },
  { value: "general", label: "General", content: <GeneralGithubUsers /> },
];

export default function ExploreUsers() {
  return (
    <DefaultDashboard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl p-4 mx-auto"
      >
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text">
              Find GitHub Users
            </h1>
            <p className="text-gray-400">
              Search and tip your favorite GitHub contributors
            </p>
          </div>

          <Tabs defaultValue="account" className="">
            <TabsList className="bg-transparent   data-[state=inactive]:text-gray-400">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  className={` ${TAB_STATE}`}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </motion.div>
    </DefaultDashboard>
  );
}
