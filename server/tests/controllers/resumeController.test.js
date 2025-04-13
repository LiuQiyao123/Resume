const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Resume = require('../../src/models/Resume');
const { generateToken } = require('../../src/utils/jwt');

describe('简历控制器测试', () => {
  let testUser;
  let token;
  let testResume;

  beforeEach(async () => {
    // 创建测试用户
    testUser = await User.create({
      openId: 'test_openid',
      nickName: '测试用户',
      avatarUrl: 'http://example.com/avatar.jpg'
    });

    // 生成测试token
    token = generateToken(testUser._id);

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
      },
      education: [
        {
          school: '测试大学',
          major: '计算机科学',
          degree: '本科',
          startDate: '2015-09',
          endDate: '2019-06'
        }
      ],
      experience: [
        {
          company: '测试公司',
          position: '软件工程师',
          startDate: '2019-07',
          endDate: '2021-06',
          description: '负责后端开发'
        }
      ],
      projects: [
        {
          name: '测试项目',
          role: '开发',
          startDate: '2020-01',
          endDate: '2020-12',
          description: '项目描述'
        }
      ],
      skills: ['JavaScript', 'Node.js', 'MongoDB']
    });
  });

  describe('GET /api/resumes', () => {
    it('应该返回用户的简历列表', async () => {
      const res = await request(app)
        .get('/api/resumes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]).toHaveProperty('_id', testResume._id.toString());
    });

    it('未授权应该返回401', async () => {
      const res = await request(app)
        .get('/api/resumes');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/resumes/:id', () => {
    it('应该返回简历详情', async () => {
      const res = await request(app)
        .get(`/api/resumes/${testResume._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id', testResume._id.toString());
      expect(res.body.data).toHaveProperty('title', '测试简历');
    });

    it('不存在的简历应该返回404', async () => {
      const res = await request(app)
        .get('/api/resumes/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/resumes', () => {
    it('应该创建新简历', async () => {
      const resumeData = {
        title: '新简历',
        basicInfo: {
          name: '李四',
          gender: '女',
          age: 28,
          phone: '13800138001',
          email: 'test2@example.com'
        }
      };

      const res = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${token}`)
        .send(resumeData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('title', '新简历');
    });

    it('缺少必填字段应该返回400', async () => {
      const res = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/resumes/:id', () => {
    it('应该更新简历', async () => {
      const updateData = {
        title: '更新后的简历',
        basicInfo: {
          name: '张三',
          phone: '13800138002'
        }
      };

      const res = await request(app)
        .put(`/api/resumes/${testResume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title', '更新后的简历');
      expect(res.body.data.basicInfo).toHaveProperty('phone', '13800138002');
    });

    it('不存在的简历应该返回404', async () => {
      const res = await request(app)
        .put('/api/resumes/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '新标题' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/resumes/:id', () => {
    it('应该删除简历', async () => {
      const res = await request(app)
        .delete(`/api/resumes/${testResume._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 验证简历已被删除
      const deletedResume = await Resume.findById(testResume._id);
      expect(deletedResume).toBeNull();
    });
  });

  describe('POST /api/resumes/:id/customize', () => {
    it('应该优化简历', async () => {
      const customizeData = {
        jobTitle: '高级软件工程师',
        jobDescription: '负责系统架构设计',
        template: 'professional'
      };

      const res = await request(app)
        .post(`/api/resumes/${testResume._id}/customize`)
        .set('Authorization', `Bearer ${token}`)
        .send(customizeData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('jobTitle', '高级软件工程师');
      expect(res.body.data).toHaveProperty('template', 'professional');
    });
  });

  describe('POST /api/resumes/:id/upload', () => {
    it('应该上传简历文件', async () => {
      const res = await request(app)
        .post(`/api/resumes/${testResume._id}/upload`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test'), 'test.pdf');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('fileUrl');
    });

    it('没有文件应该返回400', async () => {
      const res = await request(app)
        .post(`/api/resumes/${testResume._id}/upload`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/resumes/:id/file', () => {
    it('应该删除简历文件', async () => {
      // 先上传一个文件
      await request(app)
        .post(`/api/resumes/${testResume._id}/upload`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test'), 'test.pdf');

      const res = await request(app)
        .delete(`/api/resumes/${testResume._id}/file`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 验证文件已被删除
      const resume = await Resume.findById(testResume._id);
      expect(resume.fileUrl).toBe('');
    });
  });
}); 