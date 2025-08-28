import { z } from 'zod';

export const subjectSchema = z.object({
  name: z.string()
    .min(2, 'Subject name must be at least 2 characters')
    .max(50, 'Subject name must be less than 50 characters')
    .nonempty('Subject name is required'),
  
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Please select a valid color')
    .nonempty('Please select a color'),
  
  startDate: z.string()
    .nonempty('Start date is required')
    .refine(date => !isNaN(Date.parse(date)), {
      message: 'Please enter a valid start date'
    }),
  
  examDate: z.string()
    .nonempty('Exam date is required')
    .refine(date => !isNaN(Date.parse(date)), {
      message: 'Please enter a valid exam date'
    }),
  
  hoursPerWeek: z.number()
    .min(1, 'Must be at least 1 hour per week')
    .max(40, 'Cannot exceed 40 hours per week'),
  
  daysPerWeek: z.number()
    .min(1, 'Must be at least 1 day per week')
    .max(7, 'Cannot exceed 7 days per week'),
  
  intensityWeeks: z.number()
    .min(1, 'Must be at least 1 week')
    .max(20, 'Cannot exceed 20 weeks')
}).refine(data => new Date(data.examDate) > new Date(data.startDate), {
  message: 'Exam date must be after start date',
  path: ['examDate']
});

export type SubjectFormData = z.infer<typeof subjectSchema>;