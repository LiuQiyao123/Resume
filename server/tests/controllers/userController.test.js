const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/jwt');

describe('用户控制器测试', () => {
  let testUser;
  let token;

  beforeEach(async () => {
    // 创建测试用户
    testUser = await User.create({
      openId: 'test_openid',
      nickName: '测试用户',
      avatarUrl: 'http://example.com/avatar.jpg',
      points: 100
    });

    // 生成测试token
    token = generateToken(testUser._id);
  });

  describe('GET /api/users/profile', () => {
    it('应该返回用户资料', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id', testUser._id.toString());
      expect(res.body.data).toHaveProperty('nickName', '测试用户');
      expect(res.body.data).toHaveProperty('avatarUrl', 'http://example.com/avatar.jpg');
      expect(res.body.data).toHaveProperty('points', 100);
    });

    it('未授权应该返回401', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('应该更新用户资料', async () => {
      const updateData = {
        nickName: '新昵称',
        phone: '13800138000',
        email: 'test@example.com'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('nickName', '新昵称');
      expect(res.body.data).toHaveProperty('phone', '13800138000');
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('无效的手机号应该返回400', async () => {
      const updateData = {
        phone: 'invalid_phone'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('无效的邮箱应该返回400', async () => {
      const updateData = {
        email: 'invalid_email'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users/points', () => {
    it('应该返回用户积分', async () => {
      const res = await request(app)
        .get('/api/users/points')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('points', 100);
    });
  });

  describe('GET /api/users/resumes/count', () => {
    it('应该返回用户简历数量', async () => {
      const res = await request(app)
        .get('/api/users/resumes/count')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('count', 0);
    });
  });

  describe('POST /api/users/avatar', () => {
    it('应该上传用户头像', async () => {
      const res = await request(app)
        .post('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', Buffer.from('test'), 'test.jpg');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('avatarUrl');
    });

    it('没有文件应该返回400', async () => {
      const res = await request(app)
        .post('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/avatar', () => {
    it('应该删除用户头像', async () => {
      // 先上传一个头像
      await request(app)
        .post('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', Buffer.from('test'), 'test.jpg');

      const res = await request(app)
        .delete('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // 验证头像已被删除
      const user = await User.findById(testUser._id);
      expect(user.avatarUrl).toBe('');
    });
  });
}); 