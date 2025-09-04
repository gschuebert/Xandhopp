"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@portalis/ui";

const wizardSchema = z.object({
  budget: z.number().min(0),
  citizenship: z.string().min(1),
  purpose: z.enum(["residency", "investment", "work", "retirement"]),
  timeline: z.enum(["immediate", "6months", "1year", "2years"]),
});

type WizardForm = z.infer<typeof wizardSchema>;

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WizardForm>({
    resolver: zodResolver(wizardSchema),
  });

  const onSubmit = (data: WizardForm) => {
    // Mock results based on form data
    setResults({
      recommendations: [
        { country: "Georgia", score: 95, reason: "Digital nomad visa available" },
        { country: "Paraguay", score: 88, reason: "Low investment threshold" },
        { country: "Hungary", score: 82, reason: "EU access" },
      ],
    });
    setStep(4);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Your Budget</CardTitle>
              <CardDescription>What's your available investment budget?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Investment Budget (USD)
                  </label>
                  <input
                    {...register("budget", { valueAsNumber: true })}
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="50000"
                  />
                  {errors.budget && (
                    <p className="text-sm text-red-600 mt-1">{errors.budget.message}</p>
                  )}
                </div>
                <Button onClick={() => setStep(2)} className="w-full">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Current Citizenship</CardTitle>
              <CardDescription>Where are you currently a citizen?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Citizenship
                  </label>
                  <select
                    {...register("citizenship")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="DE">Germany</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.citizenship && (
                    <p className="text-sm text-red-600 mt-1">{errors.citizenship.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="w-full">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Your Goals</CardTitle>
              <CardDescription>What's your primary objective?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Purpose
                  </label>
                  <select
                    {...register("purpose")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select purpose</option>
                    <option value="residency">Permanent Residency</option>
                    <option value="investment">Investment Visa</option>
                    <option value="work">Work Visa</option>
                    <option value="retirement">Retirement</option>
                  </select>
                  {errors.purpose && (
                    <p className="text-sm text-red-600 mt-1">{errors.purpose.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Timeline
                  </label>
                  <select
                    {...register("timeline")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (0-3 months)</option>
                    <option value="6months">6 months</option>
                    <option value="1year">1 year</option>
                    <option value="2years">2+ years</option>
                  </select>
                  {errors.timeline && (
                    <p className="text-sm text-red-600 mt-1">{errors.timeline.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">
                    Back
                  </Button>
                  <Button type="submit" className="w-full">
                    Get Recommendations
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Recommendations</CardTitle>
              <CardDescription>Based on your preferences, here are the best matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results?.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{rec.country}</h3>
                      <span className="text-sm font-medium text-primary">
                        {rec.score}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                ))}
                <Button onClick={() => { setStep(1); setResults(null); }} className="w-full">
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Eligibility Wizard</h1>
        <p className="text-muted-foreground">
          Find the perfect residency program for your unique situation
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((step / 3) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
}
