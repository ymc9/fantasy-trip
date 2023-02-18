import { withPresets } from '@zenstackhq/runtime';
import type { GetServerSidePropsContext } from 'next';
import { CUSTOMER_ID_COOKIE } from '../lib/customer';
import { prisma } from '../server/db';

export function getCustomerDb(req: GetServerSidePropsContext['req']) {
    const customerId = req.cookies[CUSTOMER_ID_COOKIE];
    if (!customerId) {
        return withPresets(prisma);
    } else {
        return withPresets(prisma, { user: { id: customerId } });
    }
}
