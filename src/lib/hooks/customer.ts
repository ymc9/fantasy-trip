/* eslint-disable */
import type { Prisma, Customer } from "@prisma/client";
import { useContext } from 'react';
import { RequestHandlerContext, type RequestOptions } from '@zenstackhq/react/runtime';
import * as request from '@zenstackhq/react/runtime';

export function useCustomer() {
    const { endpoint } = useContext(RequestHandlerContext);
    const prefixesToMutate = [`${endpoint}/customer/find`, `${endpoint}/customer/aggregate`, `${endpoint}/customer/count`, `${endpoint}/customer/groupBy`];
    const mutate = request.getMutate(prefixesToMutate);

    async function create<T extends Prisma.CustomerCreateArgs>(args: Prisma.SelectSubset<T, Prisma.CustomerCreateArgs>) {
        try {
            return await request.post<Prisma.SelectSubset<T, Prisma.CustomerCreateArgs>, Prisma.CheckSelect<T, Customer, Prisma.CustomerGetPayload<T>>>(`${endpoint}/customer/create`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function createMany<T extends Prisma.CustomerCreateManyArgs>(args: Prisma.SelectSubset<T, Prisma.CustomerCreateManyArgs>) {
        return await request.post<Prisma.SelectSubset<T, Prisma.CustomerCreateManyArgs>, Prisma.BatchPayload>(`${endpoint}/customer/createMany`, args, mutate);
    }

    function findMany<T extends Prisma.CustomerFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.CustomerFindManyArgs>, options?: RequestOptions<Array<Prisma.CustomerGetPayload<T>>>) {
        return request.get<Array<Prisma.CustomerGetPayload<T>>>(`${endpoint}/customer/findMany`, args, options);
    }

    function findUnique<T extends Prisma.CustomerFindUniqueArgs>(args: Prisma.SelectSubset<T, Prisma.CustomerFindUniqueArgs>, options?: RequestOptions<Prisma.CustomerGetPayload<T>>) {
        return request.get<Prisma.CustomerGetPayload<T>>(`${endpoint}/customer/findUnique`, args, options);
    }

    function findFirst<T extends Prisma.CustomerFindFirstArgs>(args: Prisma.SelectSubset<T, Prisma.CustomerFindFirstArgs>, options?: RequestOptions<Prisma.CustomerGetPayload<T>>) {
        return request.get<Prisma.CustomerGetPayload<T>>(`${endpoint}/customer/findFirst`, args, options);
    }

    async function update<T extends Prisma.CustomerUpdateArgs>(args: Prisma.SelectSubset<T, Prisma.CustomerUpdateArgs>) {
        try {
            return await request.put<Prisma.SelectSubset<T, Prisma.CustomerUpdateArgs>, Prisma.CustomerGetPayload<T>>(`${endpoint}/customer/update`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function updateMany<T extends Prisma.CustomerUpdateManyArgs>(args: Prisma.SelectSubset<T, Prisma.CustomerUpdateManyArgs>) {
        return await request.put<Prisma.SelectSubset<T, Prisma.CustomerUpdateManyArgs>, Prisma.BatchPayload>(`${endpoint}/customer/updateMany`, args, mutate);
    }

    async function upsert<T extends Prisma.CustomerUpsertArgs>(args: Prisma.SelectSubset<T, Prisma.CustomerUpsertArgs>) {
        try {
            return await request.post<Prisma.SelectSubset<T, Prisma.CustomerUpsertArgs>, Prisma.CustomerGetPayload<T>>(`${endpoint}/customer/upsert`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function del<T extends Prisma.CustomerDeleteArgs>(args?: Prisma.SelectSubset<T, Prisma.CustomerDeleteArgs>) {
        try {
            return await request.del<Prisma.CustomerGetPayload<T>>(`${endpoint}/customer/delete`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function deleteMany<T extends Prisma.CustomerDeleteManyArgs>(args?: Prisma.SelectSubset<T, Prisma.CustomerDeleteManyArgs>) {
        return await request.del<Prisma.BatchPayload>(`${endpoint}/customer/deleteMany`, args, mutate);
    }

    function aggregate<T extends Prisma.CustomerAggregateArgs>(args: Prisma.Subset<T, Prisma.CustomerAggregateArgs>, options?: RequestOptions<Prisma.GetCustomerAggregateType<T>>) {
        return request.get<Prisma.GetCustomerAggregateType<T>>(`${endpoint}/customer/aggregate`, args, options);
    }

    function groupBy<T extends Prisma.CustomerGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? { orderBy: Prisma.UserGroupByArgs['orderBy'] } : { orderBy?: Prisma.UserGroupByArgs['orderBy'] }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.TupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True
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
        }[OrderFields]>(args: Prisma.SubsetIntersection<T, Prisma.CustomerGroupByArgs, OrderByArg> & InputErrors, options?: RequestOptions<{} extends InputErrors ? Prisma.GetCustomerGroupByPayload<T> : InputErrors>) {
        return request.get<{} extends InputErrors ? Prisma.GetCustomerGroupByPayload<T> : InputErrors>(`${endpoint}/customer/groupBy`, args, options);
    }
    return { create, createMany, findMany, findUnique, findFirst, update, updateMany, upsert, del, deleteMany, aggregate, groupBy };
}
