import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useCustomer } from './hooks';

export const CUSTOMER_ID_COOKIE = 'ft-customer-id';

export function useCurrentCustomer() {
    const [customerId, setCustomerId] = useState('');
    useEffect(() => {
        const cid = Cookies.get(CUSTOMER_ID_COOKIE);
        if (cid) {
            setCustomerId(cid);
        }
    }, []);

    const { findUnique } = useCustomer();
    return { ...findUnique({ where: { id: customerId } }, { disabled: !customerId }), customerId };
}
