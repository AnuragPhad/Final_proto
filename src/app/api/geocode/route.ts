import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const apiKey = process.env.OPENCAGE_API_KEY;

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'API key for geocoding is not configured' }, { status: 500 });
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C+${lon}&key=${apiKey}&language=en&pretty=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenCage API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch location data from external API' }, { status: response.status });
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const components = data.results[0].components;
      const state = components.state;
      let district = components.state_district || components.county || components.city;

      if (district && district.endsWith(' (District)')) {
        district = district.replace(' (District)', '').trim();
      }
      
      return NextResponse.json({ state, district });
    } else {
      return NextResponse.json({ error: 'Could not determine location from coordinates' }, { status: 404 });
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error);
    return NextResponse.json({ error: 'Internal server error during geocoding' }, { status: 500 });
  }
}
