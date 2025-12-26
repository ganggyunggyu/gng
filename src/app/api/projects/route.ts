import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createId, type Project, type ModelConfig } from '@/types';

export async function GET() {
  try {
    const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

interface CreateProjectBody {
  name: string;
  modelConfig?: Partial<ModelConfig>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectBody = await request.json();

    const project: Project = {
      id: createId.project(),
      name: body.name,
      currentPromptVersionId: null,
      modelConfig: {
        provider: body.modelConfig?.provider ?? 'openai',
        modelName: body.modelConfig?.modelName ?? 'gpt-4o',
        temperature: body.modelConfig?.temperature ?? 0.7,
        maxTokens: body.modelConfig?.maxTokens ?? 4096,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.projects.add(project);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
