// src/app/api/auth/verify-password/route.ts
import { NextResponse } from 'next/server';
import { getCurrentPassword } from '@/config/exportConfig';

export async function POST(request: Request) {
  console.log('API endpoint hit'); // デバッグログ

  try {
    const { password } = await request.json();
    const currentPassword = getCurrentPassword();
    
    console.log('Debug:', { 
      receivedPassword: password,
      currentPassword,
      matches: password === currentPassword 
    });

    return NextResponse.json({ 
      success: password === currentPassword 
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid request' 
    }, { status: 400 });
  }
}