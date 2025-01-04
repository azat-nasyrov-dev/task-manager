import { PrismaClient, Project } from '@prisma/client';
import { ProjectRepository } from '../../src/repositories/ProjectRepository';

jest.mock('@prisma/client', () => {
  const mockProjectClient = {
    create: jest.fn(),
    findMany: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      project: mockProjectClient,
    })),
  };
});

describe('ProjectRepository', () => {
  let projectRepository: ProjectRepository;
  let mockPrismaProjectClient: any;

  beforeEach(() => {
    const prismaClient = new PrismaClient();
    mockPrismaProjectClient = prismaClient.project;
    projectRepository = new ProjectRepository();
    (projectRepository as any).prisma = prismaClient;
  });

  it('should create a project', async () => {
    const mockProject: Project = {
      id: '1',
      title: 'Test Project',
      description: 'Test Description',
      userId: 'user1',
      createdAt: new Date(),
    };

    mockPrismaProjectClient.create.mockResolvedValue(mockProject);

    const result = await projectRepository.createProject(
      'Test Project',
      'Test Description',
      'user1',
    );

    expect(mockPrismaProjectClient.create).toHaveBeenCalledWith({
      data: { title: 'Test Project', description: 'Test Description', userId: 'user1' },
    });
    expect(result).toEqual(mockProject);
  });

  it('should find projects by userId', async () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Test Project 1',
        description: 'Test Description 1',
        userId: 'user1',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Test Project 2',
        description: 'Test Description 2',
        userId: 'user1',
        createdAt: new Date(),
      },
    ];

    mockPrismaProjectClient.findMany.mockResolvedValue(mockProjects);

    const result = await projectRepository.findProjectsByUserId('user1');

    expect(mockPrismaProjectClient.findMany).toHaveBeenCalledWith({
      where: { userId: 'user1' },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignedTo: true,
            assignee: {
              select: { name: true },
            },
          },
        },
      },
    });
    expect(result).toEqual(mockProjects);
  });

  it('should return an empty list when no projects are found for the user', async () => {
    mockPrismaProjectClient.findMany.mockResolvedValue([]);

    const result = await projectRepository.findProjectsByUserId('user1');

    expect(mockPrismaProjectClient.findMany).toHaveBeenCalledWith({
      where: { userId: 'user1' },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignedTo: true,
            assignee: {
              select: { name: true },
            },
          },
        },
      },
    });
    expect(result).toEqual([]);
  });
});
