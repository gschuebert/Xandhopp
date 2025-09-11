import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Try to forward the request to the Symfony API
    try {
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (backendError) {
      console.warn('Backend not available, using mock response:', backendError);
      
      // Return mock success response when backend is not available
      return NextResponse.json({
        message: 'Login successful!',
        token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9),
        user: {
          id: 1,
          email: body.email,
          name: 'Mock User'
        }
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
