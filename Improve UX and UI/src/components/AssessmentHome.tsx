import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, TrendingUp, Target, Award } from 'lucide-react';

interface AssessmentHomeProps {
  onStart: () => void;
}

export function AssessmentHome({ onStart }: AssessmentHomeProps) {
  const features = [
    {
      icon: Target,
      title: 'Personalized Insights',
      description: 'Get tailored career recommendations based on your unique profile',
    },
    {
      icon: TrendingUp,
      title: 'Growth Opportunities',
      description: 'Discover paths that align with your skills and aspirations',
    },
    {
      icon: Award,
      title: 'Expert Analysis',
      description: 'Benefit from data-driven career matching algorithms',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-8 md:p-12 shadow-2xl border-0 bg-white/80 backdrop-blur">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              Career Assessment
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 max-w-2xl mx-auto"
            >
              Discover your ideal career path through our comprehensive assessment. 
              Answer a series of questions to unlock personalized insights and recommendations.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="p-6 h-full border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="mb-2">{feature.title}</h3>
                    <p className="text-slate-600 text-sm">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Button
              onClick={onStart}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Take Assessment
            </Button>
            
            <p className="mt-4 text-sm text-slate-500">
              Takes approximately 5-7 minutes to complete
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
