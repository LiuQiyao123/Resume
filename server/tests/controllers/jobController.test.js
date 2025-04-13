const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');
const Collection = require('../../src/models/Collection');
const { generateToken } = require('../../src/utils/jwt');

describe('职位控制器测试', () => {
  let testUser;
  let token;
  let testJob;

  beforeEach(async () => {
    // 创建测试用户
    testUser = await User.create({
      openId: 'test_openid',
      nickName: '测试用户',
      avatarUrl: 'http://example.com/avatar.jpg'
    });

    // 生成测试token
    token = generateToken(testUser._id);

    // 创建测试职位
    testJob = await Job.create({
      publisher: testUser._id,
      title: '测试职位',
      company: '测试公司',
      location: '北京',
      category: '技术',
      salary: '15k-25k',
      description: '职位描述',
      requirements: '职位要求'
    });
  });

  describe('GET /api/jobs', () => {
    it('应该返回职位列表', async () => {
      const res = await request(app)
        .get('/api/jobs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]).toHaveProperty('_id', testJob._id.toString());
    });

    it('应该支持关键词搜索', async () => {
      const res = await request(app)
        .get('/api/jobs?keyword=测试');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('应该支持分类筛选', async () => {
      const res = await request(app)
        .get('/api/jobs?category=技术');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('应该支持地点筛选', async () => {
      const res = await request(app)
        .get('/api/jobs?location=北京');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('应该支持分页', async () => {
      // 创建更多测试职位
      await Job.create([
        {
          publisher: testUser._id,
          title: '测试职位2',
          company: '测试公司',
          location: '上海',
          category: '技术'
        },
        {
          publisher: testUser._id,
          title: '测试职位3',
          company: '测试公司',
          location: '广州',
          category: '技术'
        }
      ]);

      const res = await request(app)
        .get('/api/jobs?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toHaveProperty('total', 3);
      expect(res.body.pagination).toHaveProperty('pages', 2);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('应该返回职位详情', async () => {
      const res = await request(app)
        .get(`/api/jobs/${testJob._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id', testJob._id.toString());
      expect(res.body.data).toHaveProperty('title', '测试职位');
    });

    it('不存在的职位应该返回404', async () => {
      const res = await request(app)
        .get('/api/jobs/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('已登录用户应该包含收藏状态', async () => {
      // 创建收藏记录
      await Collection.create({
        user: testUser._id,
        job: testJob._id
      });

      const res = await request(app)
        .get(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isCollected', true);
    });
  });

  describe('POST /api/jobs', () => {
    it('应该创建新职位', async () => {
      const jobData = {
        title: '新职位',
        company: '新公司',
        location: '深圳',
        category: '产品',
        salary: '20k-30k',
        description: '新职位描述',
        requirements: '新职位要求'
      };

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send(jobData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('title', '新职位');
    });

    it('缺少必填字段应该返回400', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    it('应该更新职位', async () => {
      const updateData = {
        title: '更新后的职位',
        salary: '25k-35k'
      };

      const res = await request(app)
        .put(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title', '更新后的职位');
      expect(res.body.data).toHaveProperty('salary', '25k-35k');
    });

    it('不存在的职位应该返回404', async () => {
      const res = await request(app)
        .put('/api/jobs/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '新标题' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('应该删除职位', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 验证职位已被删除
      const deletedJob = await Job.findById(testJob._id);
      expect(deletedJob).toBeNull();
    });

    it('应该同时删除相关的收藏记录', async () => {
      // 创建收藏记录
      await Collection.create({
        user: testUser._id,
        job: testJob._id
      });

      await request(app)
        .delete(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${token}`);

      // 验证收藏记录已被删除
      const collections = await Collection.find({ job: testJob._id });
      expect(collections.length).toBe(0);
    });
  });

  describe('GET /api/jobs/categories', () => {
    it('应该返回职位分类列表', async () => {
      const res = await request(app)
        .get('/api/jobs/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toContain('技术');
    });
  });

  describe('GET /api/jobs/locations', () => {
    it('应该返回职位地点列表', async () => {
      const res = await request(app)
        .get('/api/jobs/locations');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toContain('北京');
    });
  });
}); 