import Dexie, { type EntityTable } from 'dexie';
import type {
  Project,
  PromptVersion,
  Thread,
  Message,
  TestCase,
  TestRun,
} from '@/types';

const db = new Dexie('GngDatabase') as Dexie & {
  projects: EntityTable<Project, 'id'>;
  promptVersions: EntityTable<PromptVersion, 'id'>;
  threads: EntityTable<Thread, 'id'>;
  messages: EntityTable<Message, 'id'>;
  testCases: EntityTable<TestCase, 'id'>;
  testRuns: EntityTable<TestRun, 'id'>;
};

db.version(1).stores({
  projects: 'id, name, createdAt, updatedAt',
  promptVersions: 'id, projectId, version, createdAt',
  threads: 'id, projectId, title, createdAt, updatedAt',
  messages: 'id, threadId, role, createdAt',
  testCases: 'id, projectId, name, createdAt',
  testRuns: 'id, testCaseId, promptVersionId, createdAt',
});

export { db };
