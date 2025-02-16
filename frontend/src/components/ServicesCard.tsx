"use client";
import Image from "next/image";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-white dark:text-neutral-200 font-sans">
        Get to know our Services.
      </h2>
      <Carousel items={cards} />
    </div>
  );
}


const data = [
  {
    category: "Validate your business idea with AI",
    title: "Idea AI.",
    src: "/diego-ph-fIq0tET6llw-unsplash.jpg",
    content: "/validation"
  },
  {
    category: "Find investors for your startup.",
    title: "Networking.",
    src: "/hunters-race-MYbhN8KaaEc-unsplash.jpg",
    content: ""
  },
  {
    category: "Explore Beyond.", 
    title: "Market Trends and Competitors.",
    src: "/marissa-grootes-ck0i9Dnjtj0-unsplash.jpg",
    content: ""
  },

  {
    category: "Get Insights based on your data.",
    title: "Analytics Dashboard.",
    src: "/path-digital-tR0jvlsmCuQ-unsplash.jpg",
    content: ""
  },
 
];
