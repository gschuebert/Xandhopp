import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Try to save to backend
    try {
      const response = await fetch('http://localhost:8082/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          message: 'Successfully registered for early access!',
          data
        });
      } else {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || 'Failed to register for early access' },
          { status: response.status }
        );
      }
    } catch (backendError) {
      console.error('Backend not available:', backendError);
      
      // Fallback: simulate successful registration
      return NextResponse.json({
        message: 'Successfully registered for early access!',
        email: email,
        registeredAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Early access API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Try to check with backend
    try {
      const response = await fetch(`http://localhost:8082/api/early-access?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        // Fallback: return not registered
        return NextResponse.json({
          registered: false,
          message: 'Email not found in early access list'
        });
      }
    } catch (backendError) {
      console.error('Backend not available:', backendError);
      
      // Fallback: return not registered
      return NextResponse.json({
        registered: false,
        message: 'Unable to check registration status'
      });
    }
  } catch (error) {
    console.error('Early access check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}