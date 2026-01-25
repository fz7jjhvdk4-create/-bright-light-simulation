"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Lightbulb, AlertCircle, CheckCircle, Target, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FiveWhyAnalysisProps {
  groupCode: string;
}

const TRANSLATIONS = {
  "sv-SE": {
    "title": "5 Varför",
    "subtitle": "Svara på \"varför\" fem gånger för att upptäcka grundorsaken till ett problem.",
    "defineProblem": "Definiera ditt problem",
    "whatChallenge": "Vilket kvalitetsproblem vill ni analysera?",
    "procrastinationHabits": "Höga reklamationskostnader",
    "lowProductInterest": "Många reklamationer",
    "familyConflicts": "Personalproblem",
    "codeQualityIssues": "Låg produktivitet",
    "chronicExhaustion": "Försenade leveranser",
    "customerSatisfaction": "Försämrad kundnöjdhet",
    "startJourney": "Starta analys",
    "whyNumber": "Varför #",
    "whyHappen": "Varför händer \"{problem}\"?",
    "whyOccur": "Varför uppstår \"{answer}\"?",
    "enterAnswer": "Skriv ditt svar...",
    "next": "Nästa",
    "analyze": "Analysera",
    "analyzingResponses": "Analyserar dina svar...",
    "discoveryComplete": "Analys klar!",
    "foundAtRoot": "Här är vad vi hittade som grundorsak",
    "rootCause": "Grundorsak",
    "solutions": "Förslag på åtgärder",
    "keyInsights": "Viktiga insikter",
    "startNewJourney": "Starta ny analys",
    "procrastinationExample": "Vi har mycket höga kostnader för reklamationer och returer som påverkar vår lönsamhet",
    "productLaunchExample": "Vi får många reklamationer från kunder trots att vi tror att vi har bra produkter och tjänster",
    "familyConflictExample": "Vi har problem med personalen - hög sjukfrånvaro, låg motivation och svårigheter att behålla medarbetare",
    "codeQualityExample": "Vår produktivitet är låg och vi når inte våra produktionsmål trots att alla jobbar hårt",
    "exhaustionExample": "Vi levererar ofta försenat till våra kunder vilket skadar vårt rykte och kundrelationer",
    "customerSatisfactionExample": "Vår kundnöjdhet har försämrats markant de senaste månaderna enligt våra mätningar och feedback",
    "saved": "Sparat!",
    "save": "Spara"
  }
};

const t = (key: string): string => TRANSLATIONS["sv-SE"][key as keyof typeof TRANSLATIONS["sv-SE"]] || key;

interface Analysis {
  rootCause: string;
  solutions: Array<{ title: string; description: string }>;
  insights: string[];
}

export function FiveWhyAnalysis({ groupCode }: FiveWhyAnalysisProps) {
  const [problem, setProblem] = useState('');
  const [whys, setWhys] = useState(['', '', '', '', '']);
  const [followUpQuestions, setFollowUpQuestions] = useState(['', '', '', '', '']);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [animateStep, setAnimateStep] = useState<number | string | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [saved, setSaved] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const analysisRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem(`five-why-${groupCode}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setProblem(data.problem || '');
      setWhys(data.whys || ['', '', '', '', '']);
      setFollowUpQuestions(data.followUpQuestions || ['', '', '', '', '']);
      setCurrentStep(data.currentStep || 0);
      setShowAnalysis(data.showAnalysis || false);
      setAnalysis(data.analysis || null);
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`five-why-${groupCode}`, JSON.stringify({
      problem,
      whys,
      followUpQuestions,
      currentStep,
      showAnalysis,
      analysis
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    if (animateStep !== null) {
      const timer = setTimeout(() => setAnimateStep(null), 500);
      return () => clearTimeout(timer);
    }
  }, [animateStep]);

  useEffect(() => {
    if (currentStep > 0 && stepRefs.current[currentStep]) {
      stepRefs.current[currentStep]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const generateFollowUpQuestion = async (stepIndex: number) => {
    setIsGeneratingQuestion(true);
    try {
      let prompt;

      if (stepIndex === 1) {
        prompt = `Du hjälper någon analysera ett problem med 5 Varför-tekniken.

Ursprungligt problem: "${problem}"

Skapa en naturlig, engagerande "Varför"-fråga som frågar varför detta problem uppstår. Frågan ska:
- Börja med "Varför"
- Vara konversationell och specifik för deras situation
- Vara mer engagerande än en generisk mall

Svara endast med frågan på svenska, ingen ytterligare text.`;
      } else {
        const previousAnswers = whys.slice(0, stepIndex - 1).filter(answer => answer.trim());
        const context = previousAnswers.map((answer, idx) => `Svar ${idx + 1}: "${answer}"`).join('\n');

        prompt = `Du hjälper någon analysera ett problem med 5 Varför-tekniken.

Ursprungligt problem: "${problem}"
${context}

Skapa en naturlig, engagerande "Varför"-fråga som frågar varför deras senaste svar uppstår. Frågan ska:
- Börja med "Varför"
- Vara konversationell och specifik för deras svar
- Vara mer engagerande än en generisk mall

Svara endast med frågan på svenska, ingen ytterligare text.`;
      }

      const response = await fetch('/api/five-why', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'question' })
      });

      const data = await response.json();
      if (data.response) {
        const newQuestions = [...followUpQuestions];
        newQuestions[stepIndex - 1] = data.response.trim();
        setFollowUpQuestions(newQuestions);
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      console.error('Error generating follow-up question:', error);
      const newQuestions = [...followUpQuestions];
      if (stepIndex === 1) {
        newQuestions[stepIndex - 1] = t('whyHappen').replace('{problem}', problem);
      } else {
        newQuestions[stepIndex - 1] = t('whyOccur').replace('{answer}', whys[stepIndex - 2]);
      }
      setFollowUpQuestions(newQuestions);
    }
    setIsGeneratingQuestion(false);
  };

  const handleProblemSubmit = async () => {
    if (problem.trim()) {
      setAnimateStep(0);
      setCurrentStep(1);
      await generateFollowUpQuestion(1);
    }
  };

  const handleWhySubmit = async (index: number) => {
    if (whys[index].trim()) {
      setAnimateStep(index + 1);
      if (index < 4) {
        setCurrentStep(index + 2);
        await generateFollowUpQuestion(index + 2);
      } else {
        analyzeResponses();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, submitFunction: () => void) => {
    if (e.key === 'Enter') {
      submitFunction();
    }
  };

  const analyzeResponses = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const prompt = `Analysera denna 5 Varför-session för ett kvalitetsproblem:

Problem: ${problem}

Varför 1: ${whys[0]}
Varför 2: ${whys[1]}
Varför 3: ${whys[2]}
Varför 4: ${whys[3]}
Varför 5: ${whys[4]}

Ge:
1. En tydlig identifiering av grundorsaken
2. Tre konkreta åtgärdsförslag för att adressera grundorsaken
3. Viktiga insikter från analysen

Formatera ditt svar som JSON med följande struktur:
{
  "rootCause": "Beskrivning av grundorsaken",
  "solutions": [
    {"title": "Åtgärd 1", "description": "Detaljerad beskrivning"},
    {"title": "Åtgärd 2", "description": "Detaljerad beskrivning"},
    {"title": "Åtgärd 3", "description": "Detaljerad beskrivning"}
  ],
  "insights": ["Insikt 1", "Insikt 2", "Insikt 3"]
}`;

      const response = await fetch('/api/five-why', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'analysis' })
      });

      const data = await response.json();
      if (data.response) {
        // Try to parse JSON from response
        let result;
        try {
          // Extract JSON from response if it contains extra text
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            result = JSON.parse(data.response);
          }
        } catch {
          result = {
            rootCause: data.response,
            solutions: [],
            insights: []
          };
        }
        setAnalysis(result);
        setShowAnalysis(true);
        setAnimateStep('analysis');
      }
    } catch (error) {
      console.error('Error analyzing responses:', error);
      setAnalysis({
        rootCause: "Kunde inte analysera på grund av ett fel. Granska dina svar och försök igen.",
        solutions: [],
        insights: ["Försök igen eller granska dina svar."]
      });
      setShowAnalysis(true);
    }
    setIsAnalyzing(false);
  };

  const getStepStyle = (stepIndex: number): React.CSSProperties => {
    return {
      transition: 'all 0.3s ease',
      backgroundColor: currentStep === stepIndex ? '#ffffff' :
                       currentStep > stepIndex || (stepIndex === 5 && showAnalysis) ? '#f3f4f6' : '#e5e7eb',
      border: `2px solid ${currentStep === stepIndex && !showAnalysis ? '#eab308' : 'transparent'}`,
      transform: animateStep === stepIndex ? 'scale(1.02)' : 'scale(1)',
      boxShadow: currentStep === stepIndex && !showAnalysis ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
    };
  };

  const resetAnalysis = () => {
    setProblem('');
    setWhys(['', '', '', '', '']);
    setFollowUpQuestions(['', '', '', '', '']);
    setCurrentStep(0);
    setShowAnalysis(false);
    setAnalysis(null);
    setAnimateStep(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {saved ? t('saved') : t('save')}
          </Button>
        </div>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Visual Flow Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 transform -translate-x-1/2" style={{ height: 'calc(100% - 100px)' }}></div>

            {/* Problem Step */}
            <div className="relative mb-6" ref={el => { stepRefs.current[0] = el; }}>
              <div
                className="rounded-xl p-5 relative z-10"
                style={getStepStyle(0)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-bold text-gray-800">{t('defineProblem')}</h2>
                </div>

                {currentStep === 0 ? (
                  <div>
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleProblemSubmit();
                        }
                      }}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-3 resize-none"
                      style={{ borderColor: '#d1d5db', minHeight: '70px' }}
                      placeholder={t('whatChallenge')}
                      rows={2}
                    />
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'procrastinationHabits', example: 'procrastinationExample' },
                          { key: 'lowProductInterest', example: 'productLaunchExample' },
                          { key: 'familyConflicts', example: 'familyConflictExample' },
                          { key: 'codeQualityIssues', example: 'codeQualityExample' },
                          { key: 'chronicExhaustion', example: 'exhaustionExample' },
                          { key: 'customerSatisfaction', example: 'customerSatisfactionExample' },
                        ].map(({ key, example }) => (
                          <button
                            key={key}
                            onClick={() => setProblem(t(example))}
                            className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:bg-yellow-50 hover:border-yellow-400 transition-colors text-gray-700"
                          >
                            {t(key)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={handleProblemSubmit}
                      className="w-full bg-yellow-500 hover:bg-yellow-600"
                      disabled={!problem.trim()}
                    >
                      {t('startJourney')}
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-700">{problem}</p>
                )}
              </div>
            </div>

            {/* Why Steps */}
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="relative mb-6" ref={el => { stepRefs.current[num] = el; }}>
                {currentStep >= num && (
                  <div
                    className="rounded-xl p-5 relative z-10"
                    style={getStepStyle(num)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-sm bg-yellow-500">
                        {num}
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">{t('whyNumber')}{num}</h2>
                    </div>

                    {currentStep === num ? (
                      <div>
                        {isGeneratingQuestion ? (
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce mx-0.5" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce mx-0.5" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce mx-0.5" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-sm text-gray-600">Tänker...</span>
                          </div>
                        ) : (
                          <p className="mb-3 text-sm text-gray-600">
                            {followUpQuestions[num - 1] ||
                             (num === 1 ? t('whyHappen').replace('{problem}', problem) :
                              t('whyOccur').replace('{answer}', whys[num - 2]))}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={whys[num - 1]}
                            onChange={(e) => {
                              const newWhys = [...whys];
                              newWhys[num - 1] = e.target.value;
                              setWhys(newWhys);
                            }}
                            onKeyPress={(e) => handleKeyPress(e, () => handleWhySubmit(num - 1))}
                            className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            style={{ borderColor: '#d1d5db' }}
                            placeholder={t('enterAnswer')}
                          />
                          <Button
                            onClick={() => handleWhySubmit(num - 1)}
                            className="bg-yellow-500 hover:bg-yellow-600"
                            disabled={!whys[num - 1].trim() || isGeneratingQuestion}
                          >
                            {num === 5 ? t('analyze') : t('next')}
                            <Send className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ) : currentStep > num ? (
                      <p className="text-gray-700">{whys[num - 1]}</p>
                    ) : null}
                  </div>
                )}
              </div>
            ))}

            {/* Analysis Loading */}
            {isAnalyzing && (
              <div className="text-center py-8" ref={analysisRef}>
                <div className="flex justify-center mb-4">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce mx-1" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce mx-1" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce mx-1" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-lg text-gray-600">{t('analyzingResponses')}</p>
              </div>
            )}

            {/* Analysis Results */}
            {showAnalysis && analysis && (
              <div
                className="mt-8 mb-6"
                style={{
                  transform: animateStep === 'analysis' ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.5s ease'
                }}
                ref={resultsRef}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('discoveryComplete')}</h2>
                  <p className="text-gray-600">{t('foundAtRoot')}</p>
                </div>

                <div className="space-y-4">
                  {/* Root Cause */}
                  <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-yellow-400">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-800">{t('rootCause')}</h3>
                    </div>
                    <p className="text-gray-700">{analysis.rootCause}</p>
                  </div>

                  {/* Solutions */}
                  {analysis.solutions && analysis.solutions.length > 0 && (
                    <div className="bg-white rounded-xl p-5 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <h3 className="text-lg font-bold text-gray-800">{t('solutions')}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {analysis.solutions.map((solution, index) => (
                          <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h4 className="font-bold mb-2 text-gray-800">{solution.title}</h4>
                            <p className="text-sm text-gray-600">{solution.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="bg-white rounded-xl p-5 shadow-lg">
                      <h3 className="text-lg font-bold mb-3 text-gray-800">{t('keyInsights')}</h3>
                      <div className="space-y-2">
                        {analysis.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                            <p className="text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center mt-6">
                  <Button
                    onClick={resetAnalysis}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    {t('startNewJourney')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
