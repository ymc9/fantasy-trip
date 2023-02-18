import { type Order, OrderStatus } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getCustomerDb } from '../server/customer-db';

type Props = {
    order: Order | null;
};

const ThankYouPage: NextPage<Props> = ({ order }) => {
    return (
        <div className="container mx-auto flex w-full flex-col py-16">
            <h1 className="text-3xl font-semibold">Thank you!</h1>
            <div className="divider"></div>

            {order && (
                <div className="flex flex-col p-8">
                    <p className="text-lg">We will confirm your order shortly and send you an email for next steps.</p>
                    <p className="mt-2">
                        <span className="text-gray-700">Order #:</span>
                        <span className="ml-2 font-semibold text-blue-800">{order.id}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ThankYouPage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
    const db = getCustomerDb(req);
    const order = await db.order.findFirst({
        where: {
            status: OrderStatus.PAID,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    return {
        props: {
            order,
        },
    };
};
