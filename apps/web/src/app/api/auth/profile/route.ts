import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, we'll simulate a successful profile update
    // In a real app, you'd need proper authentication
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: 1,
        email: body.email || 'test@example.com',
        firstName: body.firstName || 'Max',
        lastName: body.lastName || 'Mustermann',
        dateOfBirth: body.dateOfBirth || null,
        nationality: body.nationality || null,
        currentCountry: body.currentCountry || null,
        currentCity: body.currentCity || null,
        profession: body.profession || null,
        company: body.company || null,
        website: body.website || null,
        linkedin: body.linkedin || null,
        bio: body.bio || null,
        addressLine1: body.addressLine1 || null,
        addressLine2: body.addressLine2 || null,
        city: body.city || null,
        state: body.state || null,
        postalCode: body.postalCode || null,
        country: body.country || null,
        preferredLanguage: body.preferredLanguage || 'en',
        timezone: body.timezone || 'UTC',
        emailNotifications: body.emailNotifications !== undefined ? body.emailNotifications : true,
        marketingEmails: body.marketingEmails !== undefined ? body.marketingEmails : false,
        profilePublic: body.profilePublic !== undefined ? body.profilePublic : false,
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, we'll return mock profile data
    // In a real app, you'd need proper authentication
    return NextResponse.json({
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Max',
        lastName: 'Mustermann',
        dateOfBirth: null,
        nationality: null,
        currentCountry: null,
        currentCity: null,
        profession: null,
        company: null,
        website: null,
        linkedin: null,
        bio: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        preferredLanguage: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        marketingEmails: false,
        profilePublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Profile get API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}