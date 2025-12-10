import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Info, FileText, ArrowLeft } from 'lucide-react';

export function AdminMockTestPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-3xl mb-2">Create Mock Test</h2>
          <p className="text-slate-600">Create and manage mock tests for students</p>
        </div>
      </div>

      {/* Coming Soon Message Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-12 max-w-2xl mx-auto">
          <div className="text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-semibold mb-4 text-slate-800">
              Coming Soon
            </h3>

            {/* Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 text-lg">
                  This will be implemented in the 8th semester.
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 mb-8">
              The mock test creation feature is currently under development and will be available in the 8th semester.
            </p>

            {/* Back Button */}
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

