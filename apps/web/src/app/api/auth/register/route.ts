import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Try to forward the request to the Symfony API
    try {
      const response = await fetch('http://localhost:8082/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } else {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      }
    } catch (backendError) {
      console.warn('Backend not available, using mock response:', backendError);
      
      // Return mock success response when backend is not available
      return NextResponse.json({
        message: 'Account created successfully! (Demo Mode - No real email sent)',
        user_id: Math.floor(Math.random() * 1000) + 1,
        email_verification_required: true,
        demo_mode: true
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
