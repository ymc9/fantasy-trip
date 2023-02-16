import { useCustomer } from './hooks';

export function useCurrentCustomer() {
    const { findFirst } = useCustomer();
    return findFirst({});
}
