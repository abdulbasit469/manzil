import { useMemo, useEffect } from 'react';
import { MockTestRunner } from '../MockTestRunner';
import { getMockPaperPack } from '../../data/mockTestBanks';
import { Button } from '../ui/button';

interface MockTestRunPageProps {
  testName: string;
  gradientClass: string;
  onBack: () => void;
}

export function MockTestRunPage({ testName, gradientClass, onBack }: MockTestRunPageProps) {
  const pack = useMemo(() => getMockPaperPack(testName), [testName]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const container = document.querySelector('.flex-1.overflow-auto');
    if (container) {
      (container as HTMLElement).scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  if (!pack) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-8">
        <p className="mb-4 text-slate-600">Practice MCQs are not available for this test.</p>
        <Button onClick={onBack}>Back to Mock Tests</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col lg:max-w-7xl">
        <MockTestRunner pack={pack} gradientClass={gradientClass} onClose={onBack} layout="page" />
      </div>
    </div>
  );
}
