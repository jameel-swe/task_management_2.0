import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User, Project, ProjectMember, Task } from '../../entities';
import { Role, ProjectRole } from '../../common/enums/role.enum';
import { TaskPriority, TaskStatus } from '../../common/enums/task.enum';

async function seed() {
  await AppDataSource.initialize();
  const passwordHash = await bcrypt.hash('Password123!', 10);
  await AppDataSource.query('TRUNCATE "activity_logs","task_approvals","tasks","project_members","projects","refresh_tokens","users" CASCADE');
  const users = await AppDataSource.getRepository(User).save([
    { email: 'admin@example.com', name: 'Ada Admin', role: Role.ADMIN, passwordHash },
    { email: 'pm1@example.com', name: 'Priya Manager', role: Role.PROJECT_MANAGER, passwordHash },
    { email: 'pm2@example.com', name: 'Paul Manager', role: Role.PROJECT_MANAGER, passwordHash },
    { email: 'dev1@example.com', name: 'Dev One', role: Role.DEVELOPER, passwordHash },
    { email: 'dev2@example.com', name: 'Dev Two', role: Role.DEVELOPER, passwordHash },
    { email: 'dev3@example.com', name: 'Dev Three', role: Role.DEVELOPER, passwordHash }
  ]);
  const projects = await AppDataSource.getRepository(Project).save([
    { name: 'Payments Revamp', description: 'Checkout and settlement pipeline', ownerId: users[1].id },
    { name: 'Internal Platform', description: 'CI, tooling, and observability', ownerId: users[2].id }
  ]);
  await AppDataSource.getRepository(ProjectMember).save([
    { projectId: projects[0].id, userId: users[1].id, roleInProject: ProjectRole.OWNER },
    { projectId: projects[0].id, userId: users[3].id, roleInProject: ProjectRole.CONTRIBUTOR },
    { projectId: projects[0].id, userId: users[4].id, roleInProject: ProjectRole.CONTRIBUTOR },
    { projectId: projects[1].id, userId: users[2].id, roleInProject: ProjectRole.OWNER },
    { projectId: projects[1].id, userId: users[5].id, roleInProject: ProjectRole.CONTRIBUTOR },
    { projectId: projects[1].id, userId: users[3].id, roleInProject: ProjectRole.CONTRIBUTOR }
  ]);
  const tasks = Array.from({ length: 10 }, (_, i) => ({
    title: `Sample task ${i + 1}`, description: 'Seed task for local development', projectId: projects[i % 2].id,
    assigneeId: users[3 + (i % 3)].id, status: i === 9 ? TaskStatus.ESCALATED : TaskStatus.TODO,
    priority: i % 4 === 0 ? TaskPriority.URGENT : TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + (i + 1) * 86400000)
  }));
  await AppDataSource.getRepository(Task).save(tasks);
  console.log('Seeded 1 admin, 2 PMs, 3 developers, 2 projects, 10 tasks. Password: Password123!');
  await AppDataSource.destroy();
}
seed().catch((error) => { console.error(error); process.exit(1); });
