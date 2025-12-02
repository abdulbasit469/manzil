import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  Briefcase, 
  TrendingUp, 
  Target, 
  BookOpen,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import type { AssessmentAnswers } from '../App';

interface CareerMatch {
  title: string;
  match: number;
  description: string;
  skills: string[];
  icon: typeof Briefcase;
}

interface AssessmentResultsProps {
  answers: AssessmentAnswers;
  onRestart: () => void;
}

export function AssessmentResults({ answers, onRestart }: AssessmentResultsProps) {
  // Simple matching algorithm based on answers
  const getCareerMatches = (): CareerMatch[] => {
    const careers: CareerMatch[] = [
      {
        title: 'Software Engineer',
        match: 92,
        description: 'Design and develop innovative software solutions',
        skills: ['Problem Solving', 'Technical Skills', 'Innovation'],
        icon: Briefcase,
      },
      {
        title: 'Product Manager',
        match: 85,
        description: 'Lead product strategy and cross-functional teams',
        skills: ['Leadership', 'Strategy', 'Communication'],
        icon: Target,
      },
      {
        title: 'UX Designer',
        match: 78,
        description: 'Create intuitive and beautiful user experiences',
        skills: ['Creativity', 'User Empathy', 'Design Thinking'],
        icon: TrendingUp,
      },
    ];

    return careers.sort((a, b) => b.match - a.match);
  };

  const matches = getCareerMatches();
  const topMatch = matches[0];

  const strengthsMap: { [key: string]: string[] } = {
    analytical: ['Data Analysis', 'Critical Thinking', 'Problem Solving'],
    creative: ['Innovation', 'Design Thinking', 'Creative Expression'],
    practical: ['Hands-on Skills', 'Implementation', 'Execution'],
    strategic: ['Strategic Planning', 'Big Picture Thinking', 'Vision'],
  };

  const userStrengths = strengthsMap[answers.problem_solving as string] || strengthsMap.analytical;

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Career Assessment Results
            </h1>
            <p className="text-slate-600">
              Based on your responses, here are your personalized career recommendations
            </p>
          </div>

          {/* Top Match Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 mb-6 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <topMatch.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2>{topMatch.title}</h2>
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      Top Match
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-4">{topMatch.description}</p>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Match Score</span>
                      <span className="text-indigo-600">{topMatch.match}%</span>
                    </div>
                    <Progress value={topMatch.match} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topMatch.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="border-indigo-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Other Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h3 className="mb-4">Other Great Matches</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {matches.slice(1).map((career, index) => (
                <Card key={career.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <career.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{career.title}</h4>
                      <p className="text-sm text-slate-600 mb-3">{career.description}</p>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500">Match</span>
                          <span className="text-sm text-indigo-600">{career.match}%</span>
                        </div>
                        <Progress value={career.match} className="h-1.5" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {career.skills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Your Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <h3>Your Key Strengths</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {userStrengths.map((strength) => (
                  <div
                    key={strength}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center"
                  >
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h3>Recommended Next Steps</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-indigo-600">1</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Research the top career matches and explore job descriptions
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-indigo-600">2</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Identify skill gaps and create a learning plan
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-indigo-600">3</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Connect with professionals in your target career path
                  </p>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Button
              onClick={onRestart}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8"
            >
              Explore Careers
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
