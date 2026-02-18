const Joi = require('joi');

const registerSchema = Joi.object({
    ism: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak',
        'string.max': 'Ism 100 ta belgidan oshmasligi kerak',
        'any.required': 'Ism kiritish shart',
    }),
    familiya: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Familiya kamida 2 ta belgidan iborat bo\'lishi kerak',
        'any.required': 'Familiya kiritish shart',
    }),
    email: Joi.string().email().when('role', {
        is: 'student',
        then: Joi.forbidden().messages({ 'any.unknown': 'O\'quvchilar uchun email kerak emas' }),
        otherwise: Joi.required().messages({ 'any.required': 'Xodimlar uchun email shart' })
    }),
    student_id: Joi.string().regex(/^[A-Z]{2}\d{4}$/).when('role', {
        is: 'student',
        then: Joi.required().messages({
            'string.pattern.base': 'ID formati: 2 ta harf + 4 ta raqam (masalan: AA1234)',
            'any.required': 'O\'quvchi ID raqami shart'
        }),
        otherwise: Joi.forbidden()
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
        'any.required': 'Parol kiritish shart',
    }),
    role: Joi.string().valid('student', 'teacher').default('student'),
    sinf: Joi.string().max(10).allow('', null),
});

const loginSchema = Joi.object({
    identifier: Joi.string().required().messages({
        'any.required': 'Email yoki ID kiritish shart',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Parol kiritish shart',
    }),
});

const bookSchema = Joi.object({
    kitob_nomi: Joi.string().min(1).max(500).required().messages({
        'any.required': 'Kitob nomi kiritish shart',
    }),
    muallif: Joi.string().min(1).max(300).required().messages({
        'any.required': 'Muallif nomi kiritish shart',
    }),
    sahifalar_soni: Joi.number().integer().min(1).required().messages({
        'number.min': 'Sahifalar soni 0 dan katta bo\'lishi kerak',
        'any.required': 'Sahifalar soni kiritish shart',
    }),
    oqilgan_sana: Joi.date().required().messages({
        'any.required': 'O\'qilgan sana kiritish shart',
    }),
    xulosa: Joi.string().required().custom((value, helpers) => {
        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount < 100) {
            return helpers.error('any.custom', { message: `Xulosa kamida 100 so'zdan iborat bo'lishi kerak (hozir: ${wordCount} so'z)` });
        }
        return value;
    }).messages({
        'any.required': 'Xulosa yozish shart',
        'any.custom': '{{#message}}',
    }),
});

const catalogSchema = Joi.object({
    nomi: Joi.string().min(1).max(500).required(),
    muallif: Joi.string().min(1).max(300).required(),
    janr: Joi.string().max(100).allow('', null),
    sahifalar_soni: Joi.number().integer().min(1).allow(null),
    tavsif: Joi.string().allow('', null),
});

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const xatolar = error.details.map(detail => detail.message);
            return res.status(400).json({ xabar: 'Validatsiya xatosi', xatolar });
        }
        next();
    };
};

const adminCreateUserSchema = Joi.object({
    ism: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak',
        'any.required': 'Ism kiritish shart',
    }),
    familiya: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Familiya kamida 2 ta belgidan iborat bo\'lishi kerak',
        'any.required': 'Familiya kiritish shart',
    }),
    email: Joi.string().email().when('role', {
        is: 'student',
        then: Joi.forbidden().messages({ 'any.unknown': 'O\'quvchilar uchun email kerak emas' }),
        otherwise: Joi.required().messages({ 'any.required': 'Xodimlar uchun email shart' })
    }),
    student_id: Joi.string().regex(/^[A-Z]{2}\d{4}$/).when('role', {
        is: 'student',
        then: Joi.required().messages({
            'string.pattern.base': 'ID formati: 2 ta harf + 4 ta raqam (masalan: AA1234)',
            'any.required': 'O\'quvchi ID raqami shart'
        }),
        otherwise: Joi.forbidden()
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
        'any.required': 'Parol kiritish shart',
    }),
    role: Joi.string().valid('student', 'teacher', 'admin', 'superadmin').required(),
    sinf: Joi.string().allow('', null),
});

module.exports = {
    registerSchema,
    loginSchema,
    bookSchema,
    catalogSchema,
    adminCreateUserSchema,
    validate,
};
