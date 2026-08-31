'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const common_1 = require('@nestjs/common');
const supertest_1 = __importDefault(require('supertest'));
const projects_module_1 = require('./projects.module');
const projects_service_1 = require('./projects.service');
describe('ProjectsController (Integration)', () => {
  let app;
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
    const moduleFixture = await testing_1.Test.createTestingModule({
      imports: [projects_module_1.ProjectsModule],
    })
      .overrideProvider(projects_service_1.ProjectsService)
      .useValue(mockProjectsService)
      .compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new common_1.ValidationPipe({
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
      const response = await (0, supertest_1.default)(app.getHttpServer())
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
      await (0, supertest_1.default)(app.getHttpServer())
        .post('/api/v1/projects')
        .send({ description: 'No name' })
        .expect(400);
    });
    it('should return 400 for empty name', async () => {
      await (0, supertest_1.default)(app.getHttpServer())
        .post('/api/v1/projects')
        .send({ name: '' })
        .expect(400);
    });
  });
  describe('GET /api/v1/projects', () => {
    it('should return paginated projects', async () => {
      mockProjectsService.findAll.mockResolvedValueOnce({
        data: [mockProject],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });
    it('should pass search parameter to service', async () => {
      mockProjectsService.findAll.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
      await (0, supertest_1.default)(app.getHttpServer())
        .get('/api/v1/projects?search=test')
        .expect(200);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
        'test',
      );
    });
  });
  describe('GET /api/v1/projects/:id', () => {
    it('should return a project by ID', async () => {
      mockProjectsService.findOne.mockResolvedValueOnce(mockProject);
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .get('/api/v1/projects/test-uuid-123')
        .expect(200);
      expect(response.body.id).toBe(mockProject.id);
    });
    it('should return 404 for missing project', async () => {
      const { NotFoundException } = await Promise.resolve().then(() =>
        __importStar(require('@nestjs/common')),
      );
      mockProjectsService.findOne.mockRejectedValueOnce(new NotFoundException('Project not found'));
      await (0, supertest_1.default)(app.getHttpServer())
        .get('/api/v1/projects/nonexistent')
        .expect(404);
    });
  });
  describe('PATCH /api/v1/projects/:id', () => {
    it('should update a project', async () => {
      const updated = { ...mockProject, name: 'Updated' };
      mockProjectsService.update.mockResolvedValueOnce(updated);
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .patch('/api/v1/projects/test-uuid-123')
        .send({ name: 'Updated' })
        .expect(200);
      expect(response.body.name).toBe('Updated');
    });
    it('should return 404 for missing project', async () => {
      const { NotFoundException } = await Promise.resolve().then(() =>
        __importStar(require('@nestjs/common')),
      );
      mockProjectsService.update.mockRejectedValueOnce(new NotFoundException('Project not found'));
      await (0, supertest_1.default)(app.getHttpServer())
        .patch('/api/v1/projects/nonexistent')
        .send({ name: 'Test' })
        .expect(404);
    });
  });
  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete a project and return 204', async () => {
      mockProjectsService.remove.mockResolvedValueOnce(undefined);
      await (0, supertest_1.default)(app.getHttpServer())
        .delete('/api/v1/projects/test-uuid-123')
        .expect(204);
    });
    it('should return 404 for missing project', async () => {
      const { NotFoundException } = await Promise.resolve().then(() =>
        __importStar(require('@nestjs/common')),
      );
      mockProjectsService.remove.mockRejectedValueOnce(new NotFoundException('Project not found'));
      await (0, supertest_1.default)(app.getHttpServer())
        .delete('/api/v1/projects/nonexistent')
        .expect(404);
    });
  });
});
//# sourceMappingURL=projects.controller.spec.js.map
