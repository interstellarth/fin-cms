import { NextResponse } from 'next/server';

export async function GET() {
  const roles = ['Member', 'Admin', 'Editor']; // You can fetch from DB if dynamic
  return NextResponse.json(roles);
}
