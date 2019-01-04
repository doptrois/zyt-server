const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const { User, validate } = require('../../../models/user');

describe('user.generateAuthToken', () => {
    it('should return a valid JWT', () => {
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            admin: true,
        };
        const user = new User(payload);
        const token = user.generateAuthToken();
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        expect(decoded).toMatchObject(payload);
    });
});

describe('user.validate', () => {
    it('should return \'"first_name" is required\'', () => {
        const { error } = validate({});
        expect(error.details[0].message).toBe('"first_name" is required');
    });

    it('should return \'"first_name" is not allowed to be empty\'', () => {
        const { error } = validate({
            first_name: '',
        });
        expect(error.details[0].message).toBe('"first_name" is not allowed to be empty');
    });

    it('should return \'"surname" is required\'', () => {
        const { error } = validate({
            first_name: 'Max',
        });
        expect(error.details[0].message).toBe('"surname" is required');
    });

    it('should return \'"email" is required\'', () => {
        const { error } = validate({
            first_name: 'Max',
            surname: 'Muster',
        });
        expect(error.details[0].message).toBe('"email" is required');
    });

    it('should return \'"email" must be a valid email\'', () => {
        const { error } = validate({
            first_name: 'Max',
            surname: 'Muster',
            email: 'invalidEmail.com',
        });
        expect(error.details[0].message).toBe('"email" must be a valid email');
    });

    it('should return \'"avatar" with value "abcd" fails to match the required pattern: /^[0-9a-fA-F]{24}$/\'', () => {
        const { error } = validate({
            first_name: 'Max',
            surname: 'Muster',
            email: 'dummy@domain.tld',
            avatar: 'abcd',
        });
        expect(error.details[0].message).toBe('"avatar" with value "abcd" fails to match the required pattern: /^[0-9a-fA-F]{24}$/');
    });

    it('should return \'"password" is required\'', () => {
        const { error } = validate({
            first_name: 'Max',
            surname: 'Muster',
            email: 'dummy@domain.tld',
            avatar: '5c0bef9c3b86af090ef57cb9',
        });
        expect(error.details[0].message).toBe('"password" is required');
    });

    it('should return \'"password" length must be at least 6 characters long\'', () => {
        const { error } = validate({
            first_name: 'Max',
            surname: 'Muster',
            email: 'dummy@domain.tld',
            avatar: '5c0bef9c3b86af090ef57cb9',
            password: 'abc',
        });
        expect(error.details[0].message).toBe('"password" length must be at least 6 characters long');
    });

    it('should return \'no error on valid user object input\'', () => {
        const { error } = validate({
            first_name: 'Max',
            surname: 'Muster',
            email: 'dummy@domain.tld',
            avatar: '5c0bef9c3b86af090ef57cb9',
            password: 'abcdefg',
        });
        expect(error).toBeFalsy();
    });
});
