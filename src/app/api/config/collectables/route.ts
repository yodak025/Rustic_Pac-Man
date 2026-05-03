import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'src', 'config', 'collectables.yaml');
    const fileContent = readFileSync(filePath, 'utf-8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/yaml',
      },
    });
  } catch (error) {
    console.error('Error reading collectables.yaml:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
