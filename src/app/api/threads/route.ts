import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createId, type Thread } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const threads = await db.threads
      .where('projectId')
      .equals(projectId)
      .reverse()
      .sortBy('updatedAt');

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Failed to fetch threads:', error);
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
  }
}

interface CreateThreadBody {
  projectId: string;
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateThreadBody = await request.json();

    const project = await db.projects.get(body.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const thread: Thread = {
      id: createId.thread(),
      projectId: body.projectId,
      title: body.title ?? 'New Chat',
      snapshot: project.currentPromptVersionId
        ? {
            promptVersionId: project.currentPromptVersionId,
            modelConfig: project.modelConfig,
          }
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.threads.add(thread);
    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Failed to create thread:', error);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}
