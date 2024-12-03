import { z } from 'zod';

export const formSchema = z.object({
    name: z.string().min(2, {
        message: 'name must contain at least 2 characters.',
    }),
    phoneNumber: z.string().min(10, {
        message: 'Phone must contain at least 10 characters.',
    }),
    email: z.string().email({
        message: 'Invalid email format.',
    }),
    message: z.string().min(10, {
        message: 'message must contain at least 10 characters.',
    }),
});
