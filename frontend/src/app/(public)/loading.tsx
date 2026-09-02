import { SkeletonPage } from '@/components/ui/Skeleton';

/**
 * Shown while a public route's data resolves. Without this, clicking a link
 * left the previous page on screen with no feedback until the server replied —
 * which reads as a frozen site when the API is slow.
 */
export default function Loading() {
  return (
    <div className="container-page py-12 sm:py-16">
      <SkeletonPage />
    </div>
  );
}
