import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if backend is available
    const backendResponse = await fetch('http://localhost:8082/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({
      status: 'ok',
      frontend: 'running',
      backend: backendResponse.ok ? 'running' : 'unavailable',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      status: 'ok',
      frontend: 'running',
      backend: 'unavailable',
      timestamp: new Date().toISOString()
    });
  }
}
