import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-12 justify-self-end" />
            </div>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-4 px-4 py-4 border-b">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-8 justify-self-end rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 mb-6 px-4 py-2">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}
