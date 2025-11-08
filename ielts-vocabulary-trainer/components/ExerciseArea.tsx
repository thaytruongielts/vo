import React, { useState, useCallback, useEffect } from 'react';
import { generateExercise } from '../services/geminiService';
import type { Exercise } from '../types';

interface ExerciseAreaProps {
  selectedWords: string[];
}

enum FeedbackState {
  None,
  Correct,
  Incorrect
}

// Define helper components within the same file but outside the main component
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.456-2.456L11.25 18l1.938-.648a3.375 3.375 0 002.456-2.456L16.25 13.5l.648 1.938a3.375 3.375 0 002.456 2.456L21 18l-1.938.648a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-400"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-400" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-400" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

export const ExerciseArea: React.FC<ExerciseAreaProps> = ({ selectedWords }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(FeedbackState.None);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintOptions, setHintOptions] = useState<string[]>([]);

  const handleGenerateExercise = useCallback(async () => {
    if (selectedWords.length < 2) {
      setError("Please select categories with at least 2 words to generate an exercise.");
      setExercise(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setExercise(null);
    setUserAnswer('');
    setFeedback(FeedbackState.None);
    setShowAnswer(false);
    setShowHints(false);
    setHintOptions([]);

    try {
      // Pick 2 to 4 random words for variety
      const wordCount = Math.min(selectedWords.length, Math.floor(Math.random() * 3) + 2);
      const shuffled = [...selectedWords].sort(() => 0.5 - Math.random());
      const wordsForExercise = shuffled.slice(0, wordCount);
      
      const newExercise = await generateExercise(wordsForExercise);
      setExercise(newExercise);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedWords]);

  useEffect(() => {
    if (selectedWords.length > 0) {
      handleGenerateExercise();
    } else {
        setExercise(null);
        setError("Select one or more categories from the sidebar to begin.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWords.join(',')]); // Rerun when the selection changes significantly

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise) return;

    const isCorrect = userAnswer.trim().toLowerCase() === exercise.blankWord.trim().toLowerCase();
    setFeedback(isCorrect ? FeedbackState.Correct : FeedbackState.Incorrect);
    if(isCorrect) {
        setShowAnswer(true);
    }
  };

  const handleShowHints = useCallback(() => {
    if (!exercise || selectedWords.length < 3) {
      setError("Cannot generate hints. Please select categories with at least 3 unique words.");
      return;
    }
    const correctAnswer = exercise.blankWord;
    const distractors = selectedWords.filter(w => w.trim().toLowerCase() !== correctAnswer.trim().toLowerCase());

    if (distractors.length < 2) {
      setError("Not enough unique words in the selected categories to generate hints.");
      return;
    }

    const shuffled = [...distractors].sort(() => 0.5 - Math.random());
    const incorrectOptions = [shuffled[0], shuffled[1]];
    const allOptions = [correctAnswer, ...incorrectOptions].sort(() => 0.5 - Math.random());

    setHintOptions(allOptions);
    setShowHints(true);
    setFeedback(FeedbackState.None);
  }, [exercise, selectedWords]);
  
  const handleOptionClick = (option: string) => {
    if (!exercise || showAnswer || feedback !== FeedbackState.None) return;

    setUserAnswer(option);
    const isCorrect = option.trim().toLowerCase() === exercise.blankWord.trim().toLowerCase();
    setFeedback(isCorrect ? FeedbackState.Correct : FeedbackState.Incorrect);
    if (isCorrect) {
      setShowAnswer(true);
    }
  };
  
  const getInputBorderColor = () => {
    switch (feedback) {
      case FeedbackState.Correct: return 'border-green-500 focus:ring-green-500';
      case FeedbackState.Incorrect: return 'border-red-500 focus:ring-red-500';
      default: return 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500';
    }
  };

  const sentenceWithAnswer = exercise && showAnswer 
    ? exercise.sentenceWithBlank.replace('_____', `__${exercise.blankWord}__`)
    : exercise?.sentenceWithBlank;
  
  const sentenceParts = sentenceWithAnswer?.split(/(__.+__)/);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Practice Zone</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the blank with the correct word.</p>
          </div>
          <button
            onClick={handleGenerateExercise}
            disabled={isLoading || selectedWords.length < 2}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
          >
            {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-5 h-5" />}
            New Exercise
          </button>
        </div>

        {error && !isLoading && <div className="mb-4 p-4 text-sm text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg">{error}</div>}
        
        {isLoading ? (
            <div className="text-center py-12">
                <LoadingSpinner />
                <p className="mt-4 text-slate-500 dark:text-slate-400">Generating a new exercise with AI...</p>
            </div>
        ) : exercise ? (
          <div>
            <p className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300 mb-6 bg-slate-100 dark:bg-slate-700/50 p-6 rounded-lg">
                {sentenceParts?.map((part, i) => 
                  part.startsWith('__') && part.endsWith('__') ? 
                  <span key={i} className="font-bold text-green-600 dark:text-green-400 underline decoration-2 decoration-wavy">{part.slice(2,-2)}</span> :
                  part
                )}
            </p>
            <form onSubmit={handleCheckAnswer}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => {
                    setUserAnswer(e.target.value);
                    if (feedback !== FeedbackState.None) setFeedback(FeedbackState.None);
                    if (showAnswer) setShowAnswer(false);
                }}
                placeholder="Type your answer here..."
                disabled={showAnswer || showHints}
                className={`w-full px-4 py-3 text-base bg-white dark:bg-slate-900 border ${getInputBorderColor()} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors disabled:bg-slate-100 dark:disabled:bg-slate-700`}
              />
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={!userAnswer || showAnswer || showHints}
                  className="w-full sm:w-auto flex-grow px-6 py-3 text-base font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
                >
                  Check Answer
                </button>
                 <button
                  type="button"
                  onClick={handleShowHints}
                  disabled={showHints || showAnswer || !exercise || selectedWords.length < 3}
                  className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-800"
                >
                  Hint
                </button>
                 <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  disabled={showAnswer}
                  className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-800"
                >
                  Show Answer
                </button>
              </div>
            </form>
            {showHints && hintOptions.length > 0 && (
              <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Choose the correct word:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {hintOptions.map(option => {
                    const isCorrect = option.toLowerCase() === exercise.blankWord.toLowerCase();
                    const isSelected = userAnswer.toLowerCase() === option.toLowerCase();
                    let buttonClasses = 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200';

                    if (feedback !== FeedbackState.None && isSelected) {
                      buttonClasses = isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white line-through';
                    }
                    if (showAnswer && isCorrect) {
                      buttonClasses = 'bg-green-500 text-white';
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        disabled={showAnswer || feedback !== FeedbackState.None}
                        className={`w-full px-4 py-3 text-base font-semibold rounded-md shadow-sm disabled:opacity-75 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 ${buttonClasses}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
             {feedback === FeedbackState.Incorrect && !showAnswer && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">Not quite, try again or show the answer.</p>
             )}
          </div>
        ) : !error && !isLoading && (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No exercise loaded. Click "New Exercise" to start.</p>
            </div>
        )}
      </div>
    </div>
  );
};
