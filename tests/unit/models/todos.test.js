const { validate } = require('../../../models/todo');

describe('todo.validate', () => {
    it('should return \'"project" is required\'', () => {
        const { error } = validate({});
        expect(error.details[0].message).toBe('"project" is required');
    });

    it('should return \'"project" is not allowed to be empty\'', () => {
        const { error } = validate({
            project: '',
        });
        expect(error.details[0].message).toBe('"project" is not allowed to be empty');
    });

    it('should return \'"briefing" is required\'', () => {
        const { error } = validate({
            project: '5c2e2081d8782e215e41ee5d',
        });
        expect(error.details[0].message).toBe('"briefing" is required');
    });

    it('should return \'"title" is required\'', () => {
        const { error } = validate({
            project: '5c2e2081d8782e215e41ee5d',
            briefing: {},
        });
        expect(error.details[0].message).toBe('"title" is required');
    });

    it('should return \'no error on valid todo object input\'', () => {
        const { error } = validate({
            project: '5c2e2081d8782e215e41ee5d',
            briefing: {
                title: 'abcd',
                description: 'test',
            },
        });
        expect(error).toBeFalsy();
    });
});
