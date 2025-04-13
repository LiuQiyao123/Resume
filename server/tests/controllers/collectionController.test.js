const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');
const Collection = require('../../src/models/Collection');
const { generateToken } = require('../../src/utils/jwt');

describe('收藏控制器测试', () => {
  let testUser;
  let testJob;
  let token;

  beforeEach(async () => {
    // 创建测试用户
    testUser = await User.create({
      openId: 'test_openid',
      nickName: '测试用户',
      avatarUrl: 'http://example.com/avatar.jpg'
    });

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

    // 生成测试token
    token = generateToken(testUser._id);
  });

  describe('GET /api/collections', () => {
    it('应该返回用户的收藏列表', async () => {
      // 创建测试收藏
      await Collection.create({
        user: testUser._id,
        job: testJob._id
      });

      const res = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('应该支持分页', async () => {
      // 创建多个测试收藏
      await Collection.create([
        {
          user: testUser._id,
          job: testJob._id
        },
        {
          user: testUser._id,
          job: testJob._id
        }
      ]);

      const res = await request(app)
        .get('/api/collections?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination).toHaveProperty('total', 2);
      expect(res.body.pagination).toHaveProperty('pages', 2);
    });
  });

  describe('POST /api/collections', () => {
    it('应该添加收藏', async () => {
      const res = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({ job: testJob._id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('job', testJob._id.toString());
    });

    it('重复收藏应该返回400', async () => {
      // 先创建一个收藏
      await Collection.create({
        user: testUser._id,
        job: testJob._id
      });

      const res = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({ job: testJob._id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/collections/:id', () => {
    let testCollection;

    beforeEach(async () => {
      testCollection = await Collection.create({
        user: testUser._id,
        job: testJob._id
      });
    });

    it('应该删除收藏', async () => {
      const res = await request(app)
        .delete(`/api/collections/${testCollection._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 验证收藏已被删除
      const deletedCollection = await Collection.findById(testCollection._id);
      expect(deletedCollection).toBeNull();
    });

    it('不存在的收藏应该返回404', async () => {
      const res = await request(app)
        .delete('/api/collections/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/collections/check', () => {
    it('应该检查职位是否已收藏', async () => {
      // 创建测试收藏
      await Collection.create({
        user: testUser._id,
        job: testJob._id
      });

      const res = await request(app)
        .get(`/api/collections/check?job=${testJob._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isCollected', true);
      expect(res.body.data).toHaveProperty('collectionId');
    });

    it('未收藏的职位应该返回false', async () => {
      const res = await request(app)
        .get(`/api/collections/check?job=${testJob._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isCollected', false);
    });
  });

  describe('GET /api/collections/stats', () => {
    it('应该返回收藏统计信息', async () => {
      // 创建多个测试收藏
      await Collection.create([
        {
          user: testUser._id,
          job: testJob._id
        },
        {
          user: testUser._id,
          job: testJob._id
        }
      ]);

      const res = await request(app)
        .get('/api/collections/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total', 2);
    });
  });
}); 