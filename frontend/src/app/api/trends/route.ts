// app/api/trends/route.ts
import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

export async function POST(request: Request) {
  try {
    const { product } = await request.json();

    if (!product) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      );
    }

    // Fetch interest over time data from Google Trends
    const trendsResponse = await googleTrends.interestOverTime({
      keyword: product,
      startTime: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Last 1 year
      granularTimeResolution: true,
    });

    const trendsData = JSON.parse(trendsResponse).default.timelineData;

    // Format the data for easier consumption
    const formattedTrends = trendsData.map((item: { formattedAxisTime: string; value: number[] }) => ({
      date: item.formattedAxisTime,
      value: item.value[0], // Interest value
    }));

    return NextResponse.json({ product, trends: formattedTrends });
  } catch (error) {
    console.error('Error fetching Google Trends data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends data.' },
      { status: 500 }
    );
  }
}