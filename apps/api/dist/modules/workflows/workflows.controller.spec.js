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
const workflows_module_1 = require('./workflows.module');
const workflows_service_1 = require('./workflows.service');
const projects_service_1 = require('../projects/projects.service');
describe('WorkflowsController (Integration)', () => {
  let app;
  const mockWorkflow = {
    id: 'workflow-123',
    projectId: 'project-123',
    name: 'Test Workflow',
    description: null,
    status: 'draft',
    version: 1,
    definition: {
      nodes: [{ id: 'n1', type: 'log', name: 'Log', parameters: { message: 'hi' } }],
      edges: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const mockExecution = {
    id: 'exec-123',
    workflowId: 'workflow-123',
    status: 'completed',
    input: null,
    output: { logged: true },
    error: null,
    nodeResults: { n1: { logged: true } },
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  const mockWorkflowsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    execute: jest.fn(),
    findExecutions: jest.fn(),
  };
  const mockProjectsService = {
    findOne: jest.fn(),
  };
  beforeAll(async () => {
    const moduleFixture = await testing_1.Test.createTestingModule({
      imports: [workflows_module_1.WorkflowsModule],
    })
      .overrideProvider(workflows_service_1.WorkflowsService)
      .useValue(mockWorkflowsService)
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
  const baseUrl = '/api/v1/projects/project-123/workflows';
  describe('POST /api/v1/projects/:projectId/workflows', () => {
    it('should create a workflow and return 201', async () => {
      mockWorkflowsService.create.mockResolvedValueOnce(mockWorkflow);
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .post(baseUrl)
        .send({
          name: 'Test Workflow',
          definition: {
            nodes: [{ id: 'n1', type: 'log', name: 'Log', parameters: { message: 'hi' } }],
            edges: [],
          },
        })
        .expect(201);
      expect(response.body.name).toBe('Test Workflow');
    });
    it('should return 400 for missing name', async () => {
      await (0, supertest_1.default)(app.getHttpServer())
        .post(baseUrl)
        .send({
          definition: { nodes: [], edges: [] },
        })
        .expect(400);
    });
    it('should return 400 for missing definition', async () => {
      await (0, supertest_1.default)(app.getHttpServer())
        .post(baseUrl)
        .send({ name: 'Test' })
        .expect(400);
    });
  });
  describe('GET /api/v1/projects/:projectId/workflows', () => {
    it('should return paginated workflows', async () => {
      mockWorkflowsService.findAll.mockResolvedValueOnce({
        data: [mockWorkflow],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
      const response = await (0, supertest_1.default)(app.getHttpServer()).get(baseUrl).expect(200);
      expect(response.body.data).toHaveLength(1);
    });
  });
  describe('GET /api/v1/projects/:projectId/workflows/:id', () => {
    it('should return a workflow by ID', async () => {
      mockWorkflowsService.findOne.mockResolvedValueOnce(mockWorkflow);
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .get(`${baseUrl}/workflow-123`)
        .expect(200);
      expect(response.body.id).toBe('workflow-123');
    });
    it('should return 404 for missing workflow', async () => {
      const { NotFoundException } = await Promise.resolve().then(() =>
        __importStar(require('@nestjs/common')),
      );
      mockWorkflowsService.findOne.mockRejectedValueOnce(
        new NotFoundException('Workflow not found'),
      );
      await (0, supertest_1.default)(app.getHttpServer()).get(`${baseUrl}/nonexistent`).expect(404);
    });
  });
  describe('PATCH /api/v1/projects/:projectId/workflows/:id', () => {
    it('should update a workflow', async () => {
      mockWorkflowsService.update.mockResolvedValueOnce({
        ...mockWorkflow,
        name: 'Updated',
      });
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .patch(`${baseUrl}/workflow-123`)
        .send({ name: 'Updated' })
        .expect(200);
      expect(response.body.name).toBe('Updated');
    });
  });
  describe('DELETE /api/v1/projects/:projectId/workflows/:id', () => {
    it('should delete a workflow and return 204', async () => {
      mockWorkflowsService.remove.mockResolvedValueOnce(undefined);
      await (0, supertest_1.default)(app.getHttpServer())
        .delete(`${baseUrl}/workflow-123`)
        .expect(204);
    });
  });
  describe('POST /api/v1/projects/:projectId/workflows/:id/execute', () => {
    it('should execute a workflow', async () => {
      mockWorkflowsService.execute.mockResolvedValueOnce(mockExecution);
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .post(`${baseUrl}/workflow-123/execute`)
        .send({ input: {} })
        .expect(201);
      expect(response.body.status).toBe('completed');
    });
  });
  describe('GET /api/v1/projects/:projectId/workflows/:id/executions', () => {
    it('should return execution history', async () => {
      mockWorkflowsService.findExecutions.mockResolvedValueOnce({
        data: [mockExecution],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
      const response = await (0, supertest_1.default)(app.getHttpServer())
        .get(`${baseUrl}/workflow-123/executions`)
        .expect(200);
      expect(response.body.data).toHaveLength(1);
    });
  });
});
//# sourceMappingURL=workflows.controller.spec.js.map
