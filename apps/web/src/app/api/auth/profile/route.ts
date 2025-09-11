import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Forward the request to the Symfony API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await apiResponse.json();

    if (apiResponse.status === 200) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(data, { status: apiResponse.status });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const body = await request.json();
    
    // Forward the request to the Symfony API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();

    if (apiResponse.status === 200) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(data, { status: apiResponse.status });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
