import { requestHandler, type RequestHandlerOptions } from '@zenstackhq/next';
import { withPresets } from '@zenstackhq/runtime';
import { CUSTOMER_ID_COOKIE } from '../../../lib/customer';
import { prisma } from '../../../server/db';

const options: RequestHandlerOptions = {
    getPrisma: async (req) => {
        let customerId = req.cookies[CUSTOMER_ID_COOKIE];
        if (customerId) {
            const customer = await prisma.customer.findUnique({ where: { id: customerId } });
            if (!customer) {
                console.log('Customer not found, ignoring');
                customerId = undefined;
            }
        }
        return withPresets(prisma, { user: { id: customerId } });
    },
};

export default requestHandler(options);
