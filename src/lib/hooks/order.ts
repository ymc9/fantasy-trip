/* eslint-disable */
import type { Prisma, Order } from "@prisma/client";
import { useContext } from 'react';
import { RequestHandlerContext, type RequestOptions } from '@zenstackhq/react/runtime';
import * as request from '@zenstackhq/react/runtime';

export function useOrder() {
    const { endpoint } = useContext(RequestHandlerContext);
    const prefixesToMutate = [`${endpoint}/order/find`, `${endpoint}/order/aggregate`, `${endpoint}/order/count`, `${endpoint}/order/groupBy`];
    const mutate = request.getMutate(prefixesToMutate);

    async function create<T extends Prisma.OrderCreateArgs>(args: Prisma.SelectSubset<T, Prisma.OrderCreateArgs>) {
        try {
            return await request.post<Prisma.SelectSubset<T, Prisma.OrderCreateArgs>, Prisma.CheckSelect<T, Order, Prisma.OrderGetPayload<T>>>(`${endpoint}/order/create`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function createMany<T extends Prisma.OrderCreateManyArgs>(args: Prisma.SelectSubset<T, Prisma.OrderCreateManyArgs>) {
        return await request.post<Prisma.SelectSubset<T, Prisma.OrderCreateManyArgs>, Prisma.BatchPayload>(`${endpoint}/order/createMany`, args, mutate);
    }

    function findMany<T extends Prisma.OrderFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.OrderFindManyArgs>, options?: RequestOptions<Array<Prisma.OrderGetPayload<T>>>) {
        return request.get<Array<Prisma.OrderGetPayload<T>>>(`${endpoint}/order/findMany`, args, options);
    }

    function findUnique<T extends Prisma.OrderFindUniqueArgs>(args: Prisma.SelectSubset<T, Prisma.OrderFindUniqueArgs>, options?: RequestOptions<Prisma.OrderGetPayload<T>>) {
        return request.get<Prisma.OrderGetPayload<T>>(`${endpoint}/order/findUnique`, args, options);
    }

    function findFirst<T extends Prisma.OrderFindFirstArgs>(args: Prisma.SelectSubset<T, Prisma.OrderFindFirstArgs>, options?: RequestOptions<Prisma.OrderGetPayload<T>>) {
        return request.get<Prisma.OrderGetPayload<T>>(`${endpoint}/order/findFirst`, args, options);
    }

    async function update<T extends Prisma.OrderUpdateArgs>(args: Prisma.SelectSubset<T, Prisma.OrderUpdateArgs>) {
        try {
            return await request.put<Prisma.SelectSubset<T, Prisma.OrderUpdateArgs>, Prisma.OrderGetPayload<T>>(`${endpoint}/order/update`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function updateMany<T extends Prisma.OrderUpdateManyArgs>(args: Prisma.SelectSubset<T, Prisma.OrderUpdateManyArgs>) {
        return await request.put<Prisma.SelectSubset<T, Prisma.OrderUpdateManyArgs>, Prisma.BatchPayload>(`${endpoint}/order/updateMany`, args, mutate);
    }

    async function upsert<T extends Prisma.OrderUpsertArgs>(args: Prisma.SelectSubset<T, Prisma.OrderUpsertArgs>) {
        try {
            return await request.post<Prisma.SelectSubset<T, Prisma.OrderUpsertArgs>, Prisma.OrderGetPayload<T>>(`${endpoint}/order/upsert`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function del<T extends Prisma.OrderDeleteArgs>(args?: Prisma.SelectSubset<T, Prisma.OrderDeleteArgs>) {
        try {
            return await request.del<Prisma.OrderGetPayload<T>>(`${endpoint}/order/delete`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function deleteMany<T extends Prisma.OrderDeleteManyArgs>(args?: Prisma.SelectSubset<T, Prisma.OrderDeleteManyArgs>) {
        return await request.del<Prisma.BatchPayload>(`${endpoint}/order/deleteMany`, args, mutate);
    }

    function aggregate<T extends Prisma.OrderAggregateArgs>(args: Prisma.Subset<T, Prisma.OrderAggregateArgs>, options?: RequestOptions<Prisma.GetOrderAggregateType<T>>) {
        return request.get<Prisma.GetOrderAggregateType<T>>(`${endpoint}/order/aggregate`, args, options);
    }

    function groupBy<T extends Prisma.OrderGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? { orderBy: Prisma.UserGroupByArgs['orderBy'] } : { orderBy?: Prisma.UserGroupByArgs['orderBy'] }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.TupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True
        ? `Error: "by" must not be empty.`
        : HavingValid extends Prisma.False
        ? {
            [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
            ]
        }[HavingFields]
        : 'take' extends Prisma.Keys<T>
        ? 'orderBy' extends Prisma.Keys<T>
        ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
        : 'skip' extends Prisma.Keys<T>
        ? 'orderBy' extends Prisma.Keys<T>
        ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
        : ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]>(args: Prisma.SubsetIntersection<T, Prisma.OrderGroupByArgs, OrderByArg> & InputErrors, options?: RequestOptions<{} extends InputErrors ? Prisma.GetOrderGroupByPayload<T> : InputErrors>) {
        return request.get<{} extends InputErrors ? Prisma.GetOrderGroupByPayload<T> : InputErrors>(`${endpoint}/order/groupBy`, args, options);
    }
    return { create, createMany, findMany, findUnique, findFirst, update, updateMany, upsert, del, deleteMany, aggregate, groupBy };
}
