import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function AuthLoading() {
  return <LoadingScreen className="min-h-screen" message="Checking connections…" />;
}
