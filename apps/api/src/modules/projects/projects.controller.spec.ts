import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProjectsModule } from './projects.module';
import { ProjectsService } from './projects.service';

describe('ProjectsController (Integration)', () => {
  let app: INestApplication;

  const mockProject = {
    id: 'test-uuid-123',
    name: 'Test Project',
    description: 'A test project',
    createdAt: new Date('2026-08-29'),
    updatedAt: new Date('2026-08-29'),
  };

  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProjectsModule],
    })
      .overrideProvider(ProjectsService)
      .useValue(mockProjectsService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/projects', () => {
    it('should create a project and return 201', async () => {
      mockProjectsService.create.mockResolvedValueOnce(mockProject);

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({ name: 'Test Project', description: 'A test project' })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProject.id,
          name: mockProject.name,
          description: mockProject.description,
        }),
      );
    });

    it('should return 400 for missing name', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({ description: 'No name' })
        .expect(400);
    });

    it('should return 400 for empty name', async () => {
      await request(app.getHttpServer()).post('/api/v1/projects').send({ name: '' }).expect(400);
    });
  });

  describe('GET /api/v1/projects', () => {
    it('should return paginated projects', async () => {
      mockProjectsService.findAll.mockResolvedValueOnce({
        data: [mockProject],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const response = await request(app.getHttpServer()).get('/api/v1/projects').expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });

    it('should pass search parameter to service', async () => {
      mockProjectsService.findAll.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await request(app.getHttpServer()).get('/api/v1/projects?search=test').expect(200);

      expect(mockProjectsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
        'test',
      );
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return a project by ID', async () => {
      mockProjectsService.findOne.mockResolvedValueOnce(mockProject);

      const response = await request(app.getHttpServer())
        .get('/api/v1/projects/test-uuid-123')
        .expect(200);

      expect(response.body.id).toBe(mockProject.id);
    });

    it('should return 404 for missing project', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockProjectsService.findOne.mockRejectedValueOnce(new NotFoundException('Project not found'));

      await request(app.getHttpServer()).get('/api/v1/projects/nonexistent').expect(404);
    });
  });

  describe('PATCH /api/v1/projects/:id', () => {
    it('should update a project', async () => {
      const updated = { ...mockProject, name: 'Updated' };
      mockProjectsService.update.mockResolvedValueOnce(updated);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/projects/test-uuid-123')
        .send({ name: 'Updated' })
        .expect(200);

      expect(response.body.name).toBe('Updated');
    });

    it('should return 404 for missing project', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockProjectsService.update.mockRejectedValueOnce(new NotFoundException('Project not found'));

      await request(app.getHttpServer())
        .patch('/api/v1/projects/nonexistent')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete a project and return 204', async () => {
      mockProjectsService.remove.mockResolvedValueOnce(undefined);

      await request(app.getHttpServer()).delete('/api/v1/projects/test-uuid-123').expect(204);
    });

    it('should return 404 for missing project', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockProjectsService.remove.mockRejectedValueOnce(new NotFoundException('Project not found'));

      await request(app.getHttpServer()).delete('/api/v1/projects/nonexistent').expect(404);
    });
  });
});
