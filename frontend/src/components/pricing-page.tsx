import { PricingCard } from "@/components/pricing-card";

const plans = [
  {
    name: "Starter",
    price: 99,
    period: "month",
    features: [
      "AI-powered business idea validation",
      "Basic market trends analysis",
      "Access to community discussions",
      "Cancel anytime",
    ],
  },
  {
    name: "Pro",
    price: 249,
    period: "quarter",
    featured: true,
    features: [
      "In-depth business idea validation",
      "Competitor analysis and insights",
      "Access to investor network",
      "Advanced market trends tracking",
      "Everything in Starter Plan",
    ],
  },
  {
    name: "Premium",
    price: 799,
    period: "year",
    features: [
      "AI-powered predictive market trends",
      "Comprehensive investor matchmaking",
      "Real-time competitor tracking",
      "Advanced analytics dashboard",
      "Exclusive networking events",
      "Everything in Starter Plan",
      "Everything in Pro Plan",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Simple pricing for ambitious entrepreneurs</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our pricing is designed to help you validate your ideas, analyze the market, and connect with investors.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
