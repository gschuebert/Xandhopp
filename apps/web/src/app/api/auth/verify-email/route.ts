import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Mock response for testing - always return success
    // TODO: Replace with actual backend integration
    if (token === 'test' || token === 'valid') {
      return NextResponse.json(
        { message: 'Email verified successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Backend service unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}
