import { requestHandler, type RequestHandlerOptions } from '@zenstackhq/next';
import { withPresets } from '@zenstackhq/runtime';
import { prisma } from '../../../server/db';

const options: RequestHandlerOptions = {
    getPrisma: (req) => {
        const customerId = req.cookies['ft-customer-id'];
        console.log('Customer id:', customerId);
        return withPresets(prisma, { user: { id: customerId } });
    },
};

export default requestHandler(options);
