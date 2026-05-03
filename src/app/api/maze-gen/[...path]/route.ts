import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const fileName = path.join('/')
  
  // Solo permitir archivos .py por seguridad
  if (!fileName.endsWith('.py')) {
    return NextResponse.json({ error: 'Only .py files allowed' }, { status: 403 })
  }

  const filePath = join(process.cwd(), 'src', 'maze-gen', fileName)

  try {
    const content = await readFile(filePath, 'utf-8')
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
