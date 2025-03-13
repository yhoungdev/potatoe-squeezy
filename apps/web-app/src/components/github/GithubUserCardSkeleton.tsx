import { Skeleton } from "@/components/ui/skeleton";

export function GithubUserCardSkeleton() {
  return (
    <div className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex flex-col items-center text-center gap-4">
        <Skeleton className="w-24 h-24 rounded-2xl" />
        <div className="space-y-3 w-full">
          <div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <div className="flex items-center justify-center gap-2 mt-2">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
