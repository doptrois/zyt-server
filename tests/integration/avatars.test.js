const request = require('supertest');
const { User } = require('../../models/user');
const { Avatar } = require('../../models/avatar');
let server;

describe('/api/avatars', () => {
    let token;
    beforeEach(() => {
        server = require('../../index');
        token = new User().generateAuthToken();
    });
    afterEach(() => { server.close(); });
    describe('GET /', () => {
        it('should return all avatars', async () => {
            const avatars = await Avatar
                .find()
                .sort('name');
            const res = await request(server)
                .get('/api/avatars')
                .set('x-auth-token', token);
            expect(JSON.stringify(res.body)).toEqual(JSON.stringify(avatars));
        });
    });
});
