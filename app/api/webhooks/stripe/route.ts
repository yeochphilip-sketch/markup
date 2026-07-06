import { NextResponse } from 'next/server';

export async function POST() {
  // Temporarily deactivated to prioritize Option A evaluation engines
  return NextResponse.json({ disabled: true, msg: "Stripe deactivated" });
}
