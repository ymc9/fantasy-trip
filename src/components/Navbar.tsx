import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../public/img/logo-full.png';

export default function Navbar() {
    const navItems = [
        {
            id: 'home',
            label: 'HOME',
            href: '/',
        },
        {
            id: 'tours',
            label: 'TOURS',
            href: '/tours',
        },
        {
            id: 'destinations',
            label: 'DESTINATIONS',
            href: '/destinations',
        },
        {
            id: 'cart',
            label: 'CART',
            href: '/cart',
        },
    ];

    return (
        <div className="navbar border-b bg-base-100 px-8 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn-ghost btn lg:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />
                        </svg>
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
                    >
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <Link href={item.href}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <Link href="/" className="text-xl font-semibold normal-case">
                    <Image src={Logo} alt="logo" height={40} />
                </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <Link href={item.href}>{item.label}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="navbar-end">
                <a href="tel:+11234567890">📞 Call Us</a>
            </div>
        </div>
    );
}
