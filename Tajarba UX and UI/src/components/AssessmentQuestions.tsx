import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { AssessmentAnswers } from '../App';

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    id: 'work_style',
    question: 'Which work environment do you prefer?',
    options: [
      { value: 'team', label: 'Collaborative team environment' },
      { value: 'independent', label: 'Independent work with autonomy' },
      { value: 'mixed', label: 'Balance of both' },
      { value: 'leadership', label: 'Leading and managing others' },
    ],
  },
  {
    id: 'problem_solving',
    question: 'How do you approach problem-solving?',
    options: [
      { value: 'analytical', label: 'Logical and data-driven analysis' },
      { value: 'creative', label: 'Creative and innovative thinking' },
      { value: 'practical', label: 'Practical and hands-on approach' },
      { value: 'strategic', label: 'Strategic and big-picture thinking' },
    ],
  },
  {
    id: 'interests',
    question: 'What interests you most in a career?',
    options: [
      { value: 'technology', label: 'Technology and innovation' },
      { value: 'people', label: 'Working with people' },
      { value: 'creative', label: 'Creative expression' },
      { value: 'business', label: 'Business and strategy' },
    ],
  },
  {
    id: 'values',
    question: 'What do you value most in your work?',
    options: [
      { value: 'impact', label: 'Making a meaningful impact' },
      { value: 'growth', label: 'Personal growth and learning' },
      { value: 'stability', label: 'Stability and security' },
      { value: 'flexibility', label: 'Flexibility and work-life balance' },
    ],
  },
  {
    id: 'skills',
    question: 'Which skill set do you want to develop?',
    options: [
      { value: 'technical', label: 'Technical and specialized skills' },
      { value: 'communication', label: 'Communication and interpersonal skills' },
      { value: 'management', label: 'Management and leadership skills' },
      { value: 'creative', label: 'Creative and design skills' },
    ],
  },
];

interface AssessmentQuestionsProps {
  onComplete: (answers: AssessmentAnswers) => void;
}

export function AssessmentQuestions({ onComplete }: AssessmentQuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [direction, setDirection] = useState(1);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[questions[currentQuestion].id];

  const handleNext = () => {
    if (!currentAnswer) return;

    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-slate-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-indigo-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 md:p-12 shadow-2xl border-0 bg-white/80 backdrop-blur">
              <h2 className="mb-8 text-slate-800">
                {questions[currentQuestion].question}
              </h2>

              <RadioGroup
                value={currentAnswer as string}
                onValueChange={handleAnswerChange}
                className="space-y-4"
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Label
                      htmlFor={option.value}
                      className="flex items-center p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-400 cursor-pointer transition-all duration-300 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="mr-4"
                      />
                      <span className="flex-1">{option.label}</span>
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>

              <div className="flex justify-between mt-10">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={currentQuestion === 0}
                  className="px-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
                >
                  {isLastQuestion ? 'Complete' : 'Next'}
                  {!isLastQuestion && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
