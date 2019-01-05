const request = require('supertest');
const { User } = require('../../models/user');
const server = require('../../index');

describe('/api/avatars', () => {
    let token;
    beforeEach(() => {
        token = new User().generateAuthToken();
    });
    afterEach(() => { server.close(); });
    describe('GET /', () => {
        it('should return all avatars', async () => {
            const res = await request(server)
                .get('/api/avatars')
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
        });
    });
});
