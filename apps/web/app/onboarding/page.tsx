import { AuthGuard } from '@/components/AuthGuard';
import { OnboardingForm } from '@/features/onboarding/OnboardingForm';

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <main
        className="min-h-dvh max-w-md w-full mx-auto px-5 pt-8"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <OnboardingForm />
      </main>
    </AuthGuard>
  );
}
