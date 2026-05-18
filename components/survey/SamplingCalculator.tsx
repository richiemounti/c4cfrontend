'use client';

import { useState, useEffect } from 'react';
import { Calculator, Info, TrendingUp, Users, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateSampleSize, getSampleSizeCalculation } from '@/lib/api/survey';
import { useToast } from "@/hooks/use-toast";

interface SamplingCalculatorProps {
  surveyId: string;
}

interface Calculation {
  populationSize: number;
  confidenceLevel: number;
  marginOfError: number;
  recommendedSampleSize: number;
  calculatedAt: string | Date;
}

export const SamplingCalculator = ({ surveyId }: SamplingCalculatorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [current, setCurrent] = useState<Calculation | null>(null);
  const [history, setHistory] = useState<Calculation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [populationSize, setPopulationSize] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [marginOfError, setMarginOfError] = useState<number>(5);
  const [recommendedSampleSize, setRecommendedSampleSize] = useState<number | null>(null);

  useEffect(() => {
    loadExistingCalculation();
  }, [surveyId]);

  const loadExistingCalculation = async () => {
    try {
      setLoading(true);
      const response = await getSampleSizeCalculation(surveyId);
      if (response.success && response.data) {
        const { current: c, history: h } = response.data;
        if (c) {
          setCurrent(c);
          setPopulationSize(c.populationSize.toString());
          setConfidenceLevel(c.confidenceLevel);
          setMarginOfError(c.marginOfError);
          setRecommendedSampleSize(c.recommendedSampleSize);
        }
        if (h) setHistory(h);
      }
    } catch (error) {
      console.error('Error loading calculation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!populationSize || parseInt(populationSize) <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid population size',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCalculating(true);
      const response = await calculateSampleSize(surveyId, {
        populationSize: parseInt(populationSize),
        confidenceLevel,
        marginOfError
      });

      if (response.success) {
        const newCalc: Calculation = {
          populationSize: parseInt(populationSize),
          confidenceLevel,
          marginOfError,
          recommendedSampleSize: response.data.recommendedSampleSize,
          calculatedAt: new Date()
        };

        setRecommendedSampleSize(response.data.recommendedSampleSize);
        setCurrent(newCalc);

        // Prepend to local history, cap at 5
        setHistory(prev => {
          const updated = [newCalc, ...prev];
          return updated.slice(0, 5);
        });

        toast({
          title: 'Sample Size Calculated',
          description: `Recommended sample size: ${response.data.recommendedSampleSize}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Calculation Failed',
        description: 'Unable to calculate sample size. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCalculating(false);
    }
  };

  const getConfidenceLevelDescription = (level: number) => {
    switch (level) {
      case 90: return 'Lower precision, faster data collection';
      case 95: return 'Standard for most research (recommended)';
      case 99: return 'High precision, larger sample needed';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-concrete-500/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-stratosphere-100 rounded w-1/4"></div>
            <div className="h-20 bg-stratosphere-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-concrete-500/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-stratosphere-900 flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-sky-500" />
          Sample Size Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {current && (
          <Alert className="bg-sky-50 border-sky-200">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sky-700">
              Last calculated on {new Date(current.calculatedAt).toLocaleDateString()}
              with {current.confidenceLevel}% confidence and {current.marginOfError}% margin of error.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="population" className="text-stratosphere-900">
              Population Size <span className="text-coral-500">*</span>
            </Label>
            <Input
              id="population"
              type="number"
              placeholder="e.g., 10000"
              value={populationSize}
              onChange={(e) => setPopulationSize(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-sky-500">Total number of people in your target community</p>
          </div>

          <div className="space-y-2">
            <Label className="text-stratosphere-900">Confidence Level</Label>
            <Select value={confidenceLevel.toString()} onValueChange={(value) => setConfidenceLevel(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90%</SelectItem>
                <SelectItem value="95">95%</SelectItem>
                <SelectItem value="99">99%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-sky-500">{getConfidenceLevelDescription(confidenceLevel)}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-stratosphere-900">Margin of Error</Label>
            <Select value={marginOfError.toString()} onValueChange={(value) => setMarginOfError(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1%</SelectItem>
                <SelectItem value="3">3%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-sky-500">Acceptable range of uncertainty in results</p>
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={calculating || !populationSize}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white"
        >
          {calculating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-2" />
          )}
          Calculate Sample Size
        </Button>

        {recommendedSampleSize && (
          <div className="bg-coral-50 p-4 rounded-lg border border-coral-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-coral-700">Recommended Sample Size</h4>
              <Badge className="bg-coral-100 text-coral-700 border-coral-300">
                {recommendedSampleSize} responses
              </Badge>
            </div>
            <p className="text-sm text-coral-600 mb-3">
              Based on your population of {parseInt(populationSize).toLocaleString()} with {confidenceLevel}% confidence
              and {marginOfError}% margin of error.
            </p>
            <div className="flex items-center text-sm text-coral-600">
              <Users className="h-4 w-4 mr-1" />
              This represents {((recommendedSampleSize / parseInt(populationSize)) * 100).toFixed(1)}% of your target population
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="border-t border-concrete-500/20 pt-4">
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className="flex items-center justify-between w-full text-sm font-medium text-sky-500 hover:text-stratosphere-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Previous Calculations ({history.length})
              </span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2">
                {history.map((calc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-stratosphere-50 rounded-lg border border-concrete-500/10 text-sm"
                  >
                    <div className="space-y-0.5">
                      <p className="text-stratosphere-900 font-medium">
                        Pop. {calc.populationSize.toLocaleString()} &middot; {calc.confidenceLevel}% CI &middot; {calc.marginOfError}% MoE
                      </p>
                      <p className="text-xs text-sky-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(calc.calculatedAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-stratosphere-900 border-concrete-500/30 shrink-0 ml-4">
                      {calc.recommendedSampleSize} responses
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
