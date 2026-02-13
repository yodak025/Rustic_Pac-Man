import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const fileName = path.join('/')
  
  // Solo permitir archivos .yaml y .yml por seguridad
  if (!fileName.endsWith('.yaml') && !fileName.endsWith('.yml')) {
    return NextResponse.json({ error: 'Only .yaml/.yml files allowed' }, { status: 403 })
  }

  const filePath = join(process.cwd(), 'src', 'config', 'worlds', fileName)

  try {
    const content = await readFile(filePath, 'utf-8')
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
