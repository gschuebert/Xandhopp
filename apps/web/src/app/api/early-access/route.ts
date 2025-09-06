import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Get locale from referer or default to 'en'
    const referer = request.headers.get('referer') || '';
    const locale = referer.includes('/de') ? 'de' : 'en';

    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data');
    try {
      await mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Read existing data
    const filePath = join(dataDir, 'early_access.json');
    let existingData: any[] = [];
    
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }

    // Check if email already exists
    const emailExists = existingData.some(entry => entry.email === email);
    if (emailExists) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      );
    }

    // Add new entry
    const newEntry = {
      email,
      locale,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    existingData.push(newEntry);

    // Write back to file
    await writeFile(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Early access signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}