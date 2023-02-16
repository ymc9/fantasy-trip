import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import invariant from 'tiny-invariant';
import Footer from '../components/footer';
import Navbar from '../components/Navbar';
import '../styles/globals.css';
import { api } from '../utils/api';

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
    invariant(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
    return (
        <SessionProvider session={session}>
            <PayPalScriptProvider
                options={{
                    'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                }}
            >
                <Navbar />
                <Component {...pageProps} />
                <Footer />
            </PayPalScriptProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
