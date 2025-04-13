const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');
const Resume = require('../../src/models/Resume');
const Application = require('../../src/models/Application');
const { generateToken } = require('../../src/utils/jwt');

describe('申请控制器测试', () => {
  let testUser;
  let testJob;
  let testResume;
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

    // 创建测试简历
    testResume = await Resume.create({
      user: testUser._id,
      title: '测试简历',
      basicInfo: {
        name: '张三',
        gender: '男',
        age: 25,
        phone: '13800138000',
        email: 'test@example.com'
      }
    });

    // 生成测试token
    token = generateToken(testUser._id);
  });

  describe('GET /api/applications', () => {
    it('应该返回用户的申请列表', async () => {
      // 创建测试申请
      await Application.create({
        user: testUser._id,
        job: testJob._id,
        resume: testResume._id,
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('应该支持状态筛选', async () => {
      await Application.create({
        user: testUser._id,
        job: testJob._id,
        resume: testResume._id,
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/applications?status=pending')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('pending');
    });

    it('应该支持分页', async () => {
      // 创建多个测试申请
      await Application.create([
        {
          user: testUser._id,
          job: testJob._id,
          resume: testResume._id,
          status: 'pending'
        },
        {
          user: testUser._id,
          job: testJob._id,
          resume: testResume._id,
          status: 'accepted'
        }
      ]);

      const res = await request(app)
        .get('/api/applications?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination).toHaveProperty('total', 2);
      expect(res.body.pagination).toHaveProperty('pages', 2);
    });
  });

  describe('GET /api/applications/:id', () => {
    let testApplication;

    beforeEach(async () => {
      testApplication = await Application.create({
        user: testUser._id,
        job: testJob._id,
        resume: testResume._id,
        status: 'pending'
      });
    });

    it('应该返回申请详情', async () => {
      const res = await request(app)
        .get(`/api/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id', testApplication._id.toString());
      expect(res.body.data).toHaveProperty('status', 'pending');
    });

    it('不存在的申请应该返回404', async () => {
      const res = await request(app)
        .get('/api/applications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/applications', () => {
    it('应该创建新申请', async () => {
      const applicationData = {
        job: testJob._id,
        resume: testResume._id,
        coverLetter: '求职信内容'
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send(applicationData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('status', 'pending');
    });

    it('重复申请应该返回400', async () => {
      // 先创建一个申请
      await Application.create({
        user: testUser._id,
        job: testJob._id,
        resume: testResume._id,
        status: 'pending'
      });

      const applicationData = {
        job: testJob._id,
        resume: testResume._id
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send(applicationData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/applications/:id/status', () => {
    let testApplication;

    beforeEach(async () => {
      testApplication = await Application.create({
        user: testUser._id,
        job: testJob._id,
        resume: testResume._id,
        status: 'pending'
      });
    });

    it('应该更新申请状态', async () => {
      const res = await request(app)
        .put(`/api/applications/${testApplication._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status', 'accepted');
    });

    it('无效的状态应该返回400', async () => {
      const res = await request(app)
        .put(`/api/applications/${testApplication._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    let testApplication;

    beforeEach(async () => {
      testApplication = await Application.create({
        user: testUser._id,
        job: testJob._id,
        resume: testResume._id,
        status: 'pending'
      });
    });

    it('应该删除申请', async () => {
      const res = await request(app)
        .delete(`/api/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 验证申请已被删除
      const deletedApplication = await Application.findById(testApplication._id);
      expect(deletedApplication).toBeNull();
    });

    it('非待处理状态的申请不能删除', async () => {
      // 更新申请状态为已接受
      await Application.findByIdAndUpdate(testApplication._id, { status: 'accepted' });

      const res = await request(app)
        .delete(`/api/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/applications/stats', () => {
    it('应该返回申请统计信息', async () => {
      // 创建不同状态的申请
      await Application.create([
        {
          user: testUser._id,
          job: testJob._id,
          resume: testResume._id,
          status: 'pending'
        },
        {
          user: testUser._id,
          job: testJob._id,
          resume: testResume._id,
          status: 'accepted'
        },
        {
          user: testUser._id,
          job: testJob._id,
          resume: testResume._id,
          status: 'rejected'
        }
      ]);

      const res = await request(app)
        .get('/api/applications/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pending', 1);
      expect(res.body.data).toHaveProperty('accepted', 1);
      expect(res.body.data).toHaveProperty('rejected', 1);
    });
  });
}); 